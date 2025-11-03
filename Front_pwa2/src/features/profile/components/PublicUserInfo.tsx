import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star, Share2, Calendar } from 'lucide-react'
import { Profile } from '../services/profileService'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { FollowButton } from './FollowButton'

interface PublicUserInfoProps {
  /** Perfil del usuario */
  profile: Profile
  /** Si es artista */
  isArtist: boolean
  /** Si está cargando */
  isLoading?: boolean
}

/**
 * Componente para mostrar la información del perfil público de un usuario
 * 
 * @example
 * ```tsx
 * <PublicUserInfo
 *   profile={profile}
 *   isArtist={profile.userType === 'artist'}
 * />
 * ```
 */
export function PublicUserInfo({
  profile,
  isArtist
}: PublicUserInfoProps) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const isOwnProfile = currentUser?.id === profile.id

  // Mock stats (deberían venir del backend)
  const stats = {
    followers: profile.followersCount || 0,
    rating: 4.5,
    completedAppointments: 150,
    responseRate: 98
  }

  if (isArtist) {
    // Layout para Tatuador: Foto pequeña a la izquierda
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex gap-4 items-start">
          {/* Avatar pequeño */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 p-0.5">
              <div className="w-full h-full rounded-full bg-black p-0.5">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.username}
                    width={64}
                    height={64}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info a la derecha */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold mb-1 truncate">
                  {profile.fullName || profile.username}
                </h2>
                <p className="text-sm text-gray-400 mb-2">
                  Tatuador/a {profile.city && `en ${profile.city}`}
                </p>
              </div>
              {/* Seguidores pequeño */}
              <div className="text-center ml-3 flex items-center gap-2">
                <div>
                  <div className="text-lg font-bold">
                    {stats.followers < 1000
                      ? stats.followers
                      : `${(stats.followers / 1000).toFixed(1)}K`}
                  </div>
                  <div className="text-[10px] text-gray-500">Seguidores</div>
                </div>
                <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                  <Share2 className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Rating con estrellas */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(stats.rating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : i < stats.rating
                        ? 'fill-yellow-500/50 text-yellow-500'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">{stats.rating}</span>
            </div>

                   {/* Action Buttons - Solo si NO es tu propio perfil */}
                   {!isOwnProfile && (
                     <div className="flex gap-2.5">
                {/* Botón de Seguir/Dejar de seguir - Sincronizado globalmente */}
                <FollowButton
                  targetUserId={profile.id}
                  userData={{
                    username: profile.username,
                    fullName: profile.fullName,
                    avatar: profile.avatar
                  }}
                  initialFollowState={profile.isFollowing ?? false}
                  onFollowChange={(isFollowing) => {
                   
                  }}
                  size="md"
                  showText={true}
                />
                <button
                  onClick={() => router.push('/appointments/book')}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  Cotización
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-300 text-sm mt-4 leading-relaxed">{profile.bio}</p>
        )}
      </motion.div>
    )
  }

  // Layout para Usuario Normal: Foto grande centrada
  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex justify-center mb-6"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1">
          <div className="w-full h-full rounded-full bg-black p-1">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.username}
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Name and Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">
          {profile.fullName || profile.username}
        </h2>
        <p className="text-gray-400">
          Usuario {profile.city && `en ${profile.city}`}
        </p>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-300 mt-3 max-w-md mx-auto">{profile.bio}</p>
        )}

        {/* Botón de Seguir para usuarios normales - Solo si NO es tu propio perfil - Sincronizado globalmente */}
        {!isOwnProfile && (
          <div className="flex justify-center mt-4">
            <FollowButton
              targetUserId={profile.id}
              userData={{
                username: profile.username,
                fullName: profile.fullName,
                avatar: profile.avatar
              }}
              initialFollowState={profile.isFollowing ?? false}
              onFollowChange={(isFollowing) => {
               
              }}
              size="md"
              showText={true}
            />
          </div>
        )}
      </div>

    </>
  )
}

