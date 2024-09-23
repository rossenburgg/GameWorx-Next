// app/api/withdraw/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function POST(request: Request) {
  console.log('API: Received POST request for withdrawal')
  try {
    const { amount, userId, mobileNumber } = await request.json()
    console.log('API: Request body', { amount, userId, mobileNumber })

    // Deduct amount from user's wallet
    const { data: walletData, error: walletError } = await supabase.rpc('decrement_balance', { 
      p_user_id: userId, 
      p_amount: amount 
    })

    if (walletError) {
      console.error('API: Failed to update wallet:', walletError)
      return NextResponse.json({ success: false, error: 'Failed to update wallet' }, { status: 500 })
    }

    // Record withdrawal transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal to mobile money',
        reference: `W${Date.now()}`,
      })

    if (transactionError) {
      console.error('API: Error recording transaction:', transactionError)
      // Revert the wallet balance if transaction recording fails
      await supabase.rpc('increment_balance', { p_user_id: userId, p_amount: amount })
      return NextResponse.json({ success: false, error: 'Failed to record transaction' }, { status: 500 })
    }

    // Here you would typically integrate with a mobile money API to process the withdrawal
    // For now, we'll just simulate a successful withdrawal
    console.log(`API: Simulating withdrawal of ${amount} to ${mobileNumber}`)

    console.log('API: Withdrawal process completed successfully')
    return NextResponse.json({ success: true, newBalance: walletData })

  } catch (error) {
    console.error('API: Error in withdrawal process:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}