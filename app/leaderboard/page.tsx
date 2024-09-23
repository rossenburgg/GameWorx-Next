// app/leaderboard/page.tsx
import { LeaderboardTable } from '@/components/leaderboard-table'

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>
      <LeaderboardTable />
    </div>
  )
}