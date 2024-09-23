// app/admin/layout.tsx
import { Sidebar } from '@/components/admin/sidebar'

export default function AdminLayout({
  
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}