// app/api/verify-payment/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('API: Environment variables check');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('PAYSTACK_SECRET_KEY:', PAYSTACK_SECRET_KEY ? 'Set' : 'Not set');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function POST(request: Request) {
  console.log('API: Received POST request');
  try {
    const { reference, amount, userId } = await request.json();
    console.log('API: Request body', { reference, amount, userId });

    // Verify the payment with Paystack
    console.log('API: Verifying payment with Paystack');
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API: Paystack verification response status:', verifyResponse.status);
    const verifyData = await verifyResponse.json();
    console.log('API: Paystack verification response:', verifyData);

    if (!verifyResponse.ok || !verifyData.status || verifyData.data.status !== 'success') {
      console.error('API: Payment verification failed');
      
      // Record failed transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        amount: amount,
        type: 'top_up',
        status: 'failed',
        description: 'Paystack top-up failed',
        reference: reference
      });

      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    // Payment is successful, update the database
    console.log('API: Updating wallet balance');
    const { data: walletData, error: walletError } = await supabase.rpc('increment_balance', { 
      p_user_id: userId, 
      p_amount: amount 
    });

    console.log('API: Wallet update result:', { data: walletData, error: walletError });

    if (walletError) {
      console.error('API: Failed to update wallet:', walletError);
      return NextResponse.json({ success: false, error: 'Failed to update wallet' }, { status: 500 });
    }

    // Record successful transaction
    console.log('API: Recording transaction');
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'top_up',
        status: 'success',
        description: 'Paystack top-up successful',
        reference: reference
      });

    console.log('API: Transaction record result:', { data: transactionData, error: transactionError });

    if (transactionError) {
      console.error('API: Error recording transaction:', transactionError);
      // We don't return here because the balance was already updated
    }

    console.log('API: Payment process completed successfully');
    return NextResponse.json({ success: true, newBalance: walletData });

  } catch (error) {
    console.error('API: Error in payment verification process:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}