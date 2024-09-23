// components/match-details.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { showToast } from "@/lib/utils"
import { useAdminCheck } from '@/hooks/useAdminCheck'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { FireIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)


export function MatchDetails({ id }: { id: string }) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState('')
  const { isAdmin } = useAdminCheck()
  const router = useRouter()

  useEffect(() => {
    async function fetchMatch() {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id (name),
          team2:teams!team2_id (name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching match:', error)
        showToast('Error', 'Failed to fetch match details', "destructive")
      } else {
        setMatch(data)
        setResult(data.result || '')
      }
      setLoading(false)
    }

    fetchMatch()
  }, [id])

  const handleUpdateResult = async () => {
    setUpdating(true)
    const { error } = await supabase
      .from('matches')
      .update({ result, status: 'completed' })
      .eq('id', id)

    if (error) {
      console.error('Error updating match result:', error)
      showToast('Error', 'Failed to update match result', "destructive")
    } else {
      showToast('Success', 'Match result updated successfully')
      setMatch({ ...match, result, status: 'completed' })
    }
    setUpdating(false)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  }

  if (!match) {
    return <div>Match not found</div>
  }

  const [team1Score, team2Score] = match.result ? match.result.split('-').map(Number) : [0, 0]

  const barChartData = {
    labels: ['Kills', 'Assists', 'Deaths'],
    datasets: [
      {
        label: match.team1.name,
        data: [65, 59, 80],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: match.team2.name,
        data: [70, 62, 75],
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      },
    ],
  }

  const doughnutChartData = {
    labels: [match.team1.name, match.team2.name],
    datasets: [{
      data: [team1Score, team2Score],
      backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(53, 162, 235, 0.8)'],
    }]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{match.team1.name} vs {match.team2.name}</h1>
        <p className="text-lg md:text-xl text-gray-500">{match.game}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="text-xl md:text-2xl font-bold mb-2 md:mb-0">{match.team1.name}</div>
              <div className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">{match.result || 'VS'}</div>
              <div className="text-xl md:text-2xl font-bold">{match.team2.name}</div>
            </div>
            <div className="mb-6 flex justify-center">
              {match.status === 'live' ? (
                <div className="bg-red-500 text-white px-4 py-2 rounded-full inline-flex items-center">
                  <FireIcon className="w-5 h-5 mr-2" />
                  LIVE
                </div>
              ) : match.status === 'completed' ? (
                <div className="bg-green-500 text-white px-4 py-2 rounded-full inline-flex items-center">
                  <TrophyIcon className="w-5 h-5 mr-2" />
                  Completed
                </div>
              ) : (
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-full inline-flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Upcoming
                </div>
              )}
            </div>
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div className="w-full h-64 md:h-auto">
                <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div className="w-full h-64 md:h-auto">
                <Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Match Details</h2>
            <p><strong>Date:</strong> {new Date(match.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {match.time}</p>
            {match.result && <p><strong>Final Score:</strong> {match.result}</p>}
            
            {isAdmin && match.status !== 'completed' && (
              <div className="mt-6">
                <Label htmlFor="result">Update Result</Label>
                <Input
                  id="result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="e.g., 3-2"
                  className="mb-2"
                />
                <Button onClick={handleUpdateResult} disabled={updating} className="w-full">
                  {updating ? 'Updating...' : 'Update Result'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => router.push('/matches')} className="mt-8 w-full md:w-auto">Back to Matches</Button>
    </div>
  )
}