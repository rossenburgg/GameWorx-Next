// components/CountdownButton.tsx
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

interface CountdownButtonProps {
  unlockTime: Date
  onClaim: () => void
  claimed: boolean
}

export function CountdownButton({ unlockTime, onClaim, claimed }: CountdownButtonProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const difference = unlockTime.getTime() - now.getTime()

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft('')
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [unlockTime])

  if (claimed) {
    return <Button disabled>Claimed</Button>
  }

  if (timeLeft) {
    return <Button disabled className="w-full">{timeLeft}</Button>
  }

  return <Button onClick={onClaim} className="w-full">Claim</Button>
}