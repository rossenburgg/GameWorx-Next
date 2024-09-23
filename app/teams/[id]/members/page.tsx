// app/teams/[id]/members/page.tsx
import { TeamMembersManagement } from '@/components/team-members-management'

export default function ManageTeamMembersPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Manage Team Members</h1>
      <TeamMembersManagement teamId={params.id} />
    </div>
  )
}