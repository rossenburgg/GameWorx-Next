// components/user-dashboard.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from 'next/link'

// Dummy data for registered events and upcoming matches
const dummyRegisteredEvents = [
  { id: 1, type: 'league', name: "Summer Showdown 2024", game: "Fortnite", startDate: "2024-06-01" },
  { id: 2, type: 'tournament', name: "Rocket League Rumble", game: "Rocket League", date: "2024-07-15" },
]

const dummyUpcomingMatches = [
  { id: 1, event: "Summer Showdown 2024", opponent: "Team Awesome", date: "2024-06-05", time: "18:00" },
  { id: 2, event: "Rocket League Rumble", opponent: "Rocket Masters", date: "2024-07-15", time: "14:30" },
]

export function UserDashboard() {
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRegisteredEvents(dummyRegisteredEvents)
      setUpcomingMatches(dummyUpcomingMatches)
      setLoading(false)
    }, 1000)
  }, [])

  const SkeletonRow = ({ cols }) => (
    <TableRow>
      {[...Array(cols)].map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-6 w-full" />
        </TableCell>
      ))}
    </TableRow>
  )

  const CardSkeleton = ({ title, rows }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(4)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-6 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(rows)].map((_, i) => (
              <SkeletonRow key={i} cols={4} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-8">
        <CardSkeleton title="My Registered Events" rows={2} />
        <CardSkeleton title="Upcoming Matches" rows={2} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>My Registered Events</CardTitle>
        </CardHeader>
        <CardContent>
          {registeredEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registeredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.game}</TableCell>
                    <TableCell>{event.startDate || event.date}</TableCell>
                    <TableCell>
                      <Link href={`/${event.type}s/${event.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>You haven't registered for any events yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMatches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.event}</TableCell>
                    <TableCell>{match.opponent}</TableCell>
                    <TableCell>{match.date}</TableCell>
                    <TableCell>{match.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>You don't have any upcoming matches.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}