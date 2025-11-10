import React, { useMemo, useRef, useCallback, useEffect } from 'react'
import { WindowScroller, AutoSizer, Grid, CellMeasurer, CellMeasurerCache } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { UserPost } from '../services/profileService'
import ProfilePostItem from './ProfilePostItem'

// Tipo para el cellRenderer de react-virtualized
interface CellRendererParams {
  key: string
  rowIndex: number
  columnIndex: number
  style: React.CSSProperties
  parent: {
    invalidateCellSizeAfterRender?: (params: { rowIndex: number; columnIndex: number }) => void
  }
}

interface ProfilePostGridProps {
  posts: UserPost[]
  onPostClick: (postId: string) => void
  aspectRatio?: '3/4' | 'auto'
  className?: string
}

// Cache para medir el tamaño de las celdas
// Usa post.id como key para caching por post
const createCache = () => new CellMeasurerCache({
  defaultHeight: 250,
  fixedWidth: true
})

/**
 * Componente de grid virtualizado para mostrar posts en 2 columnas
 * Compatible con scroll restoration existente usando WindowScroller
 */
export default function ProfilePostGrid({ 
  posts, 
  onPostClick, 
  aspectRatio = '3/4',
  className = ''
}: ProfilePostGridProps) {
  const cacheRef = useRef<CellMeasurerCache | null>(null)
  // Map para rastrear qué celdas ya han sido medidas (usando key como identificador)
  const measuredCellsRef = useRef<Set<string>>(new Set())
  
  // Inicializar cache solo una vez
  if (!cacheRef.current) {
    cacheRef.current = createCache()
  }

  const cache = cacheRef.current

  // Limpiar el Set de celdas medidas cuando cambian los posts
  // Esto asegura que las nuevas celdas se midan correctamente
  useEffect(() => {
    measuredCellsRef.current.clear()
  }, [posts])

  // Calcular número de filas (2 columnas)
  const rowCount = useMemo(() => Math.ceil(posts.length / 2), [posts.length])
  const columnCount = 2

  // Obtener post por índice (rowIndex * 2 + columnIndex)
  const getPost = useCallback((rowIndex: number, columnIndex: number): UserPost | null => {
    const index = rowIndex * 2 + columnIndex
    return index < posts.length ? posts[index] : null
  }, [posts])

  // Handler para renderizar celda
  const cellRenderer = useCallback(({ 
    key, 
    rowIndex, 
    columnIndex, 
    style, 
    parent 
  }: CellRendererParams) => {
    const post = getPost(rowIndex, columnIndex)
    const index = rowIndex * 2 + columnIndex

    // Si no hay post, renderizar placeholder vacío
    if (!post) {
      return (
        <div key={key} style={style} />
      )
    }

    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        rowIndex={rowIndex}
        columnIndex={columnIndex}
        columnCount={columnCount}
      >
        {({ measure, registerChild }) => {
          const cellKey = key
          const measuredSet = measuredCellsRef.current
          
          return (
            <div 
              ref={(ref) => {
                if (registerChild) {
                  registerChild(ref)
                }
                // Medir solo una vez por celda de forma asíncrona para evitar bucles infinitos
                if (ref && !measuredSet.has(cellKey)) {
                  // Marcar inmediatamente para evitar múltiples programaciones
                  measuredSet.add(cellKey)
                  
                  // Usar requestAnimationFrame + setTimeout para diferir la medición
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      // Verificar que el ref aún existe
                      if (!ref) return
                      
                      const img = ref.querySelector('img')
                      if (img && !img.complete) {
                        // Si la imagen aún no está cargada, esperar a que cargue
                        const handleLoad = () => measure()
                        const handleError = () => measure()
                        // Usar { once: true } para que los listeners se remuevan automáticamente
                        img.addEventListener('load', handleLoad, { once: true })
                        img.addEventListener('error', handleError, { once: true })
                      } else {
                        // Imagen ya cargada o no hay imagen, medir
                        measure()
                      }
                    }, 0)
                  })
                }
              }}
              style={style} 
              className="p-1.5"
            >
              <ProfilePostItem
                post={post}
                index={index}
                onClick={onPostClick}
                aspectRatio={aspectRatio}
              />
            </div>
          )
        }}
      </CellMeasurer>
    )
  }, [getPost, onPostClick, aspectRatio, cache, columnCount])

  if (posts.length === 0) {
    return null
  }

  return (
    <WindowScroller 
      scrollElement={typeof window !== 'undefined' ? window : undefined}
    >
      {({ height, isScrolling, onChildScroll, scrollTop, registerChild }) => (
        <div 
          ref={(ref) => {
            if (registerChild) {
              registerChild(ref)
            }
          }}
          style={{ width: '100%' }}
        >
          <AutoSizer disableHeight>
            {({ width }) => {
              if (width === 0) return null
              
              // Calcular ancho de columna: (ancho total - gap entre columnas) / 2
              const gap = 12 // gap-3 = 12px
              const columnWidth = (width - gap) / 2
              
              // Calcular altura de fila basada en aspect ratio
              const padding = 12 // p-1.5 = 6px por lado = 12px total vertical
              const rowHeight = aspectRatio === '3/4' 
                ? columnWidth * 1.33 + padding // width * aspect ratio + padding
                : 200 + padding // altura mínima para auto

              return (
                <Grid
                  autoHeight
                  className={className}
                  columnCount={columnCount}
                  columnWidth={columnWidth}
                  height={height || 600} // Fallback height
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  rowCount={rowCount}
                  rowHeight={rowHeight}
                  scrollTop={scrollTop}
                  width={width}
                  cellRenderer={cellRenderer}
                  deferredMeasurementCache={cache}
                  overscanRowCount={2}
                  style={{ outline: 'none' }}
                />
              )
            }}
          </AutoSizer>
        </div>
      )}
    </WindowScroller>
  )
}

