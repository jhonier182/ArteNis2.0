import React from 'react'

interface SocialLoginButtonsProps {
  onGoogleClick?: () => void
  onAppleClick?: () => void
  onFacebookClick?: () => void
}

export function SocialLoginButtons({
  onGoogleClick,
  onAppleClick,
  onFacebookClick,
}: SocialLoginButtonsProps) {
  const handleGoogleClick = () => {
    // TODO: Implementar OAuth con Google
    onGoogleClick?.()
  }

  const handleAppleClick = () => {
    // TODO: Implementar OAuth con Apple
    onAppleClick?.()
  }

  const handleFacebookClick = () => {
    // TODO: Implementar OAuth con Facebook
    onFacebookClick?.()
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-900 text-gray-400">O continúa con</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGoogleClick}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
        >
          <span className="text-lg font-bold text-blue-400">G</span>
        </button>
        <button
          type="button"
          onClick={handleAppleClick}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
        >
          <span className="text-lg">🍎</span>
        </button>
        <button
          type="button"
          onClick={handleFacebookClick}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
        >
          <span className="text-lg font-bold text-blue-500">f</span>
        </button>
      </div>
    </div>
  )
}

