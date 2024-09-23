// components/login-modal.tsx
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AuthForm } from './auth-form'

export function LoginModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <AuthForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}