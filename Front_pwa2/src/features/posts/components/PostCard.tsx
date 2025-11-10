import React from 'react'
import { Post } from '../services/postService'
import { Card } from '@/components/ui/Card'
import { formatRelativeTime } from '@/utils/formatters'
import { LikeButton, SaveButton } from '@/components/ui/buttons'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
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
            <SaveButton
              postId={post.id}
              initialSaved={post.isSaved || false}
              size="sm"
              variant="minimal"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

