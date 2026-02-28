import { useToggleFollow } from '@/queries/auth.queries'

interface FollowButtonProps {
  username: string
  isFollowing: boolean
  currentUsername?: string
}

export function FollowButton({ username, isFollowing, currentUsername }: FollowButtonProps) {
  const { mutate, isPending } = useToggleFollow(username)

  if (username === currentUsername) return null

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        mutate()
      }}
      disabled={isPending}
      className={isFollowing ? 'btn-secondary text-sm px-4 py-1.5' : 'btn-primary text-sm px-4 py-1.5'}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
          {isFollowing ? 'Unfollowing…' : 'Following…'}
        </span>
      ) : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
