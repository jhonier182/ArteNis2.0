import Head from 'next/head'
import Link from 'next/link'
import { RefreshCw, Home } from 'lucide-react'

export default function Custom500() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>Error del servidor - ArteNis 2.0</title>
      </Head>
      
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <span className="text-4xl font-bold text-red-600">5</span>
          <span className="text-4xl font-bold text-red-600">0</span>
          <span className="text-4xl font-bold text-red-600">0</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error del servidor</h1>
        <p className="text-gray-600 mb-6">
          Algo salió mal en nuestro servidor. Por favor, intenta nuevamente en unos momentos.
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
          <Link href="/">
            <button className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
