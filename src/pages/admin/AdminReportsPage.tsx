import { useState } from 'react'
import { Flag, Check, X } from 'lucide-react'
import { useReportsQuery, useResolveReport } from '@/queries/moderation.queries'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { UserAvatar } from '@/components/user/UserAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, cn } from '@/lib/utils'
import type { ReportStatus } from '@/types'

const tabs: ReportStatus[] = ['PENDING', 'RESOLVED', 'DISMISSED']

export default function AdminReportsPage() {
  const [status, setStatus] = useState<ReportStatus>('PENDING')
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useReportsQuery(status)
  const { mutate: resolveReport, isPending: resolving } = useResolveReport()
  const sentinelRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, !!hasNextPage)

  const reports = data?.pages.flatMap((p) => p.results) ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">Reports</h1>

      {/* Status tabs */}
      <div className="flex gap-1 rounded-xl bg-bg-secondary p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={cn(
              'flex-1 py-1.5 text-sm font-medium rounded-lg transition-all',
              status === tab ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'
            )}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <EmptyState icon={Flag} title={`No ${status.toLowerCase()} reports`} />
      )}

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <UserAvatar user={report.reported_user} size="sm" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {report.reported_user.first_name} {report.reported_user.last_name}
                  </p>
                  <p className="text-xs text-text-muted">Reported by @{report.reported_by.username}</p>
                </div>
              </div>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                report.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' :
                report.status === 'RESOLVED' ? 'bg-green-500/10 text-green-600' :
                'bg-border text-text-muted'
              )}>
                {report.status}
              </span>
            </div>

            {report.post?.caption && (
              <div className="bg-bg-secondary rounded-xl p-3">
                <p className="text-xs text-text-muted mb-1">Post</p>
                <p className="text-sm text-text-primary">{report.post.caption}</p>
              </div>
            )}

            <div className="bg-bg-secondary rounded-xl p-3">
              <p className="text-xs text-text-muted mb-1">Reason</p>
              <p className="text-sm text-text-secondary">{report.reason}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">{formatDate(report.created_at)}</span>

              {report.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolveReport({ reportId: report.id, action: 'DISMISSED' })}
                    disabled={resolving}
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    <X size={13} /> Dismiss
                  </button>
                  <button
                    onClick={() => resolveReport({ reportId: report.id, action: 'RESOLVED' })}
                    disabled={resolving}
                    className="btn-primary text-xs flex items-center gap-1"
                  >
                    <Check size={13} /> Resolve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />
    </div>
  )
}
