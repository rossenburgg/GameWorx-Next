// components/tournament-bracket.tsx
import { Card, CardContent } from "@/components/ui/card"

interface Match {
  id: string
  team1: { name: string }
  team2: { name: string }
  result: string | null
  round: number
}

interface TournamentBracketProps {
  matches: Match[]
}

export function TournamentBracket({ matches }: TournamentBracketProps) {
  const rounds = Math.max(...matches.map(match => match.round))

  return (
    <div className="flex justify-around space-x-4 overflow-x-auto">
      {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
        <div key={round} className="flex flex-col space-y-4">
          <h3 className="text-center font-bold">Round {round}</h3>
          {matches
            .filter(match => match.round === round)
            .map(match => (
              <Card key={match.id} className="w-48">
                <CardContent className="p-2">
                  <p className="text-sm">{match.team1.name}</p>
                  <p className="text-sm">{match.team2.name}</p>
                  {match.result && <p className="text-xs mt-1">Result: {match.result}</p>}
                </CardContent>
              </Card>
            ))
          }
        </div>
      ))}
    </div>
  )
}