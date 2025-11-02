import React from 'react'
import { Post } from '../services/postService'
import { Card } from '@/components/ui/Card'
import { formatRelativeTime } from '@/utils/formatters'
import { LikeButton } from '@/features/likes'

interface PostCardProps {
  post: Post
  onSave?: (postId: string) => void
}

export function PostCard({ post, onSave }: PostCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full aspect-square bg-gray-200 dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">{post.title}</h3>
        {post.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{post.description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatRelativeTime(post.createdAt)}</span>
          <div className="flex gap-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked}
              initialLikesCount={post.likesCount}
              size="sm"
            />
            <button onClick={() => onSave?.(post.id)} className="hover:text-primary-600">
              {post.isSaved ? '💾' : '🔖'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

