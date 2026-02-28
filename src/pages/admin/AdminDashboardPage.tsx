import { Link } from 'react-router-dom'
import { Flag, Users, Shield, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const cards = [
  { to: '/admin/reports', icon: Flag, title: 'Reports', description: 'Review and resolve user reports', color: 'text-orange-500 bg-orange-500/10' },
  { to: '/admin/users', icon: Users, title: 'Users', description: 'Manage users, roles, and suspensions', color: 'text-blue-500 bg-blue-500/10', adminOnly: true },
  { to: '/admin/violations', icon: Shield, title: 'AI Violations', description: 'Review AI moderation logs', color: 'text-yellow-500 bg-yellow-500/10', adminOnly: true },
]

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-accent" size={28} />
        <div>
          <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-sm text-text-muted">Role: {user?.role}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {cards.filter((c) => !c.adminOnly || isAdmin).map(({ to, icon: Icon, title, description, color }) => (
          <Link
            key={to}
            to={to}
            className="card-hover p-5 flex items-center gap-4"
          >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">{title}</h2>
              <p className="text-sm text-text-secondary">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
