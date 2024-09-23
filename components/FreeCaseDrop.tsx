// components/FreeCaseDrop.tsx
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export function FreeCaseDrop() {
  const [timeLeft, setTimeLeft] = useState<number>(3600) // 1 hour in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = time % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-purple-700 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Free Case Drop</h3>
      <p className="text-sm mb-2">Get your Case now before the timer runs out!</p>
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
        <Button variant="secondary">Get Case</Button>
      </div>
    </div>
  )
}