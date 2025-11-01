import { LoginForm } from '../components/LoginForm'
import { Logo } from '@/components/ui/Logo'
import { AuthBackground } from '@/components/ui/AuthBackground'

export default function LoginPage() {
  return (
    <AuthBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo y Branding */}
          <div className="text-center space-y-2">
            <Logo size="lg" showText={true} />
            <p className="text-gray-400 text-sm">Conecta con los mejores tatuadores</p>
          </div>

          {/* Formulario */}
          <div className="bg-black/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
            <LoginForm />
          </div>
        </div>
      </div>
    </AuthBackground>
  )
}

