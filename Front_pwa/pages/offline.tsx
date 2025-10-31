import Head from 'next/head'
import { WifiOff } from 'lucide-react'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>Sin conexión - ArteNis 2.0</title>
      </Head>
      
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sin conexión</h1>
        <p className="text-gray-600 mb-6">
          No tienes conexión a internet. Verifica tu conexión e intenta nuevamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
