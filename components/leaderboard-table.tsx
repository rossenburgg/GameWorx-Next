// components/leaderboard-table.tsx
"use client"

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

const dummyData = [
  { rank: 1, name: "John Doe", avatar: "/avatars/01.png", score: 1000, winRate: "75%", kd: "2.5" },
  { rank: 2, name: "Jane Smith", avatar: "/avatars/02.png", score: 950, winRate: "70%", kd: "2.3" },
  { rank: 3, name: "Bob Johnson", avatar: "/avatars/03.png", score: 900, winRate: "68%", kd: "2.1" },
  // Add more dummy data as needed
]

export function LeaderboardTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = dummyData.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Input
        className="max-w-sm mb-4"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Win Rate</TableHead>
            <TableHead>K/D Ratio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((player) => (
            <TableRow key={player.rank} className="hover:bg-muted/50">
              <TableCell className="font-medium">{player.rank}</TableCell>
              <TableCell className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.avatar} alt={player.name} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <span>{player.name}</span>
              </TableCell>
              <TableCell>{player.score}</TableCell>
              <TableCell>{player.winRate}</TableCell>
              <TableCell>{player.kd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}