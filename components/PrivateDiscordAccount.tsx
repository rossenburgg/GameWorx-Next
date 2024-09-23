// components/PrivateDiscordAccount.tsx
import { Button } from "@/components/ui/button"

export function PrivateDiscordAccount() {
  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4">PRIVATE DISCORD ACCOUNT</h2>
      <p className="text-sm mb-4">A private discord account will be available from level 10</p>
      <Button variant="secondary">Get access</Button>
    </div>
  )
}