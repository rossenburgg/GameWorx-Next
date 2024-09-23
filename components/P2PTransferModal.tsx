// components/P2PTransferModal.tsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface P2PTransferModalProps {
  onTransfer: (recipientEmail: string, amount: number) => Promise<void>
  balance: number
}

export function P2PTransferModal({ onTransfer, balance }: P2PTransferModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleTransfer = async () => {
    if (recipientEmail && Number(amount) > 0 && Number(amount) <= balance) {
      await onTransfer(recipientEmail, Number(amount))
      setIsOpen(false)
      setRecipientEmail('')
      setAmount('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Transfer Xcoin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Xcoin to Another User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipient" className="text-right">
              Recipient Email
            </Label>
            <Input
              id="recipient"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
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
        <Button onClick={handleTransfer} disabled={!recipientEmail || Number(amount) <= 0 || Number(amount) > balance}>
          Transfer
        </Button>
      </DialogContent>
    </Dialog>
  )
}