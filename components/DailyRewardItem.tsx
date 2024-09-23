// components/DailyRewardItem.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CountdownButton } from './CountdownButton'

interface DailyRewardItemProps {
  day: number
  claimed: boolean
  unlockTime?: string
  onClaim: () => void
  rewardType: string
  rewardAmount: number
}

export function DailyRewardItem({ day, claimed, unlockTime, onClaim, rewardType, rewardAmount }: DailyRewardItemProps) {
  return (
    <Card className="w-40">
      <CardContent className="pt-4">
        <div className="flex justify-center">
          <img src="/reward-chest.png" alt="Reward chest" className="w-20 h-20" />
        </div>
        <p className="text-center mt-2">{rewardType}</p>
        <p className="text-center text-sm text-muted-foreground">{rewardAmount}</p>
      </CardContent>
      <CardFooter>
        {claimed ? (
          <Button className="w-full" disabled>Claimed</Button>
        ) : unlockTime ? (
          <Button className="w-full" disabled>Unlocks at {unlockTime}</Button>
        ) : (
          <Button className="w-full" onClick={onClaim}>Claim</Button>
        )}
      </CardFooter>
    </Card>
  )
}