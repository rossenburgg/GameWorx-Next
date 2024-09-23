// app/dashboard/page.tsx
import { UserDashboard } from '@/components/user-dashboard'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>
      <UserDashboard />
    </div>
  )
}