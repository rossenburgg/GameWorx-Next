// components/WithdrawButton.tsx
"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WithdrawButtonProps {
  balance: number
  onWithdraw: (amount: number) => void
}

export default function WithdrawButton({ balance, onWithdraw }: WithdrawButtonProps) {
  const [amount, setAmount] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleWithdraw = () => {
    const withdrawAmount = Number(amount)
    if (withdrawAmount > 0 && withdrawAmount <= balance) {
      onWithdraw(withdrawAmount)
      setIsOpen(false)
      setAmount('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Withdraw</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Enter the amount of Xcoin you want to withdraw. Your request will be reviewed by an admin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleWithdraw} disabled={Number(amount) <= 0 || Number(amount) > balance}>
          Submit Withdrawal Request
        </Button>
      </DialogContent>
    </Dialog>
  )
}