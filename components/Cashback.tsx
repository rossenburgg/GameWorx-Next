// components/Cashback.tsx
import Image from 'next/image'

interface CashbackTier {
  level: string
  percentage: string
}

const cashbackTiers: CashbackTier[] = [
  { level: 'LEVEL 1-59', percentage: '0.5%' },
  { level: 'LEVEL 1-59', percentage: '0.7%' },
  { level: 'LEVEL 1-59', percentage: '0.9%' },
  { level: 'LEVEL 1-59', percentage: '1%' },
]

export function Cashback() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">CASHBACK</h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">UNVERIFIED ACCOUNT</h3>
        <p className="text-sm mb-4">
          Earn up to 1% cashback on each purchase with our Royale Rewards
          program. Level up by opening more mystery boxes and increase your
          cashback percentage. Redeem your cashback rewards once per hour
          and get more value from your purchases.
        </p>
        <div className="flex justify-between items-center">
          <Image
            src="/gameworx-logo-transparent.png"
            alt="Cashback mascot"
            width={100}
            height={100}
          />
          <div className="grid grid-cols-4 gap-4">
            {cashbackTiers.map((tier, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-700 p-2 rounded-lg mb-2">
                  <Image
                    src={`/tier-${index + 1}.png`}
                    alt={`Tier ${index + 1}`}
                    width={50}
                    height={50}
                  />
                </div>
                <div className="text-xs">{tier.level}</div>
                <div className="text-lg font-bold">{tier.percentage}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}