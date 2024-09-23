// components/registration-form.tsx
"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { showToast } from "@/lib/utils"

interface RegistrationFormProps {
  eventType: 'league' | 'tournament'
  eventId: string
  eventName: string
  onSuccess: () => void
}

export function RegistrationForm({ eventType, eventId, eventName, onSuccess }: RegistrationFormProps) {
  const [teamName, setTeamName] = useState('')
  const [captainName, setCaptainName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real app, you would send this data to your backend
    console.log('Registration data:', { eventType, eventId, teamName, captainName, email })

    showToast('Registration successful', `Your team has been registered for ${eventName}`)
    setLoading(false)
    onSuccess()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for {eventName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="captainName">Captain Name</Label>
            <Input
              id="captainName"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}