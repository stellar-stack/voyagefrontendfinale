import { useState } from 'react'
import { Search } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSearchUsers } from '@/queries/auth.queries'
import { useDebounce } from '@/hooks/useDebounce'
import { authApi } from '@/api'
import { UserAvatar } from '@/components/user/UserAvatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, extractErrorMessage } from '@/lib/utils'

export default function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 400)
  const { data: users, isLoading } = useSearchUsers(debounced)

  const { mutate: suspend } = useMutation({
    mutationFn: ({ userId, days }: { userId: number; days: 1 | 7 | 30 | 90 }) =>
      authApi.suspendUser(userId, days),
    onSuccess: () => toast.success('User suspended'),
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  const { mutate: clearViolations } = useMutation({
    mutationFn: (userId: number) => authApi.clearViolations(userId),
    onSuccess: () => toast.success('Violations cleared'),
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  const { mutate: promote } = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'USER' | 'MODERATOR' }) =>
      authApi.promoteUser(userId, role),
    onSuccess: () => toast.success('Role updated'),
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">User Management</h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users…"
          className="input-base pl-9"
        />
      </div>

      {isLoading && query.length >= 2 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      )}

      <div className="space-y-3">
        {(users ?? []).map((user) => (
          <div key={user.id} className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary">
                    {user.first_name} {user.last_name}
                  </p>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-medium',
                    user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                    user.role === 'MODERATOR' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-border text-text-muted'
                  )}>
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  @{user.username} · {user.followers_count} followers
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => suspend({ userId: user.id, days: 7 })}
                className="btn-secondary text-xs"
              >
                Suspend 7d
              </button>
              <button
                onClick={() => suspend({ userId: user.id, days: 30 })}
                className="btn-secondary text-xs"
              >
                Suspend 30d
              </button>
              <button
                onClick={() => clearViolations(user.id)}
                className="btn-secondary text-xs"
              >
                Clear Violations
              </button>
              {user.role === 'USER' && (
                <button
                  onClick={() => promote({ userId: user.id, role: 'MODERATOR' })}
                  className="btn-primary text-xs"
                >
                  Make Moderator
                </button>
              )}
              {user.role === 'MODERATOR' && (
                <button
                  onClick={() => promote({ userId: user.id, role: 'USER' })}
                  className="btn-secondary text-xs"
                >
                  Remove Moderator
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
