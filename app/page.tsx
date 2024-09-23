// app/page.tsx
import { NewsCarousel } from '@/components/news-carousel'
import { LeaguesList } from '@/components/leagues-list'
import { TournamentsList } from '@/components/tournaments-list'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">News</h2>
        <NewsCarousel />
      </section>
      
      <div className="border-t border-gray-700 my-8 opacity-50"></div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Leagues</h2>
        <LeaguesList />
      </section>
      
      <div className="border-t border-gray-700 my-8 opacity-50"></div>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Tournaments</h2>
        <TournamentsList />
      </section>
    </div>
  )
}