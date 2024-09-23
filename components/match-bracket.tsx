// components/match-bracket.tsx
import React from 'react';
import { Trophy } from 'lucide-react';

interface MatchBracketProps {
  team1: string;
  team2: string;
  result: string | null;
}

export function MatchBracket({ team1, team2, result }: MatchBracketProps) {
  const [score1, score2] = result ? result.split('-').map(Number) : [null, null];
  const winner = score1 > score2 ? team1 : score2 > score1 ? team2 : null;

  return (
    <div className="flex flex-col items-center space-y-4 my-8">
      <div className="flex items-center justify-center w-full">
        <div className="flex-1 text-right pr-4">
          <div className={`p-2 border ${winner === team1 ? 'border-green-500' : 'border-gray-300'} rounded`}>
            {team1}
          </div>
        </div>
        <div className="w-px h-16 bg-gray-300"></div>
        <div className="flex-1 text-left pl-4">
          <div className={`p-2 border ${winner === team2 ? 'border-green-500' : 'border-gray-300'} rounded`}>
            {team2}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <div className="text-2xl font-bold">{score1 ?? '-'}</div>
        <div className="text-xl">vs</div>
        <div className="text-2xl font-bold">{score2 ?? '-'}</div>
      </div>
      {winner && (
        <div className="flex flex-col items-center">
          <Trophy className="w-12 h-12 text-yellow-400" />
          <div className="mt-2 text-lg font-bold">{winner}</div>
        </div>
      )}
    </div>
  );
}