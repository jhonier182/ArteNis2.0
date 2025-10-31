import Head from 'next/head'
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>Página no encontrada - ArteNis 2.0</title>
      </Head>
      
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <span className="text-4xl font-bold text-red-600">4</span>
          <span className="text-4xl font-bold text-red-600">0</span>
          <span className="text-4xl font-bold text-red-600">4</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </button>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
