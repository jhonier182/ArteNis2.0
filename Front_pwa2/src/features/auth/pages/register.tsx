import { RegisterForm } from '../components/RegisterForm'
import { Logo } from '@/components/ui/Logo'
import { AuthBackground } from '@/components/ui/AuthBackground'

export default function RegisterPage() {
  return (
    <AuthBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo y Branding */}
          <div className="text-center space-y-2">
            <Logo size="lg" showText={true} />
            <p className="text-gray-400 text-sm">Únete a la comunidad de tatuajes más grande</p>
          </div>

          {/* Formulario */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Registro de Usuario</h2>
            <RegisterForm />
          </div>
        </div>
      </div>
    </AuthBackground>
  )
}
