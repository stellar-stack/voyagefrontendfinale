import { useState, useEffect } from 'react'
import { useToggleFollow } from '@/queries/auth.queries'

interface FollowButtonProps {
  username: string
  isFollowing: boolean
  currentUsername?: string
}

export function FollowButton({ username, isFollowing: serverFollowing, currentUsername }: FollowButtonProps) {
  // Local state gives instant UI feedback regardless of which cache the parent reads from.
  // This is critical because UserCard (Followers/Following/Search pages) reads from list caches,
  // not QUERY_KEYS.USER(username), so TanStack cache updates don't reach it.
  const [following, setFollowing] = useState(serverFollowing)
  const { mutate, isPending } = useToggleFollow(username)

  // Sync when server data settles (e.g. after invalidation re-fetches)
  useEffect(() => {
    if (!isPending) setFollowing(serverFollowing)
  }, [serverFollowing, isPending])

  if (username === currentUsername) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const next = !following
    setFollowing(next)
    mutate(undefined, {
      onError: () => setFollowing(!next), // rollback on server error
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={
        following
          ? 'group btn-secondary text-sm px-4 py-1.5 min-w-[96px]'
          : 'btn-primary text-sm px-4 py-1.5 min-w-[96px]'
      }
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
          {following ? 'Following…' : 'Unfollowing…'}
        </span>
      ) : following ? (
        <span>
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline text-red-500">Unfollow</span>
        </span>
      ) : (
        'Follow'
      )}
    </button>
  )
}
