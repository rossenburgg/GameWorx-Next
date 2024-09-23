// components/league-details.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RegistrationForm } from "@/components/registration-form"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DetailSkeleton } from "@/components/skeletons"

const dummyLeagueDetails = {
  id: 1,
  name: "Summer Showdown 2024",
  game: "Fortnite",
  startDate: "2024-06-01",
  endDate: "2024-08-31",
  registrationOpen: true,
  description: "Join the biggest Fortnite league of the summer! Compete against the best players and win amazing prizes.",
  prizes: ["1st Place: $10,000", "2nd Place: $5,000", "3rd Place: $2,500"],
  rules: ["Standard Fortnite Battle Royale rules apply", "Players must be 16 years or older", "All matches will be streamed"],
  schedule: [
    { date: "2024-06-01", event: "Opening Ceremony and First Matches" },
    { date: "2024-07-15", event: "Mid-Season Break" },
    { date: "2024-08-31", event: "Grand Finals" },
  ]
}

export function LeagueDetails({ id }: { id: string }) {
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeague(dummyLeagueDetails)
      setLoading(false)
    }, 1000)
  }, [id])

  if (loading) {
    return <DetailSkeleton />
  }

  if (!league) {
    return <div>League not found</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">{league.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>League Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Game:</strong> {league.game}</p>
          <p><strong>Dates:</strong> {league.startDate} to {league.endDate}</p>
          <p><strong>Description:</strong> {league.description}</p>
          <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
            <DialogTrigger asChild>
              <Button className="mt-4" disabled={!league.registrationOpen}>
                {league.registrationOpen ? "Register Now" : "Registration Closed"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <RegistrationForm
                eventType="league"
                eventId={id}
                eventName={league.name}
                onSuccess={() => setShowRegistrationForm(false)}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Prizes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            {league.prizes.map((prize, index) => (
              <li key={index}>{prize}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            {league.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {league.schedule.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.event}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}