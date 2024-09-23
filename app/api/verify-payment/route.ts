import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function calculateXC(ghs: number): number {
  if (ghs < 10) {
    return 0; // Return 0 for amounts less than 10 GHS
  }
  
  const conversionTable = [
    { ghs: 10, xc: 100 },
    { ghs: 20, xc: 210 },
    { ghs: 50, xc: 550 },
    { ghs: 100, xc: 1200 },
    { ghs: 200, xc: 2600 },
    { ghs: 500, xc: 6500 }
  ];

  let lower = conversionTable[0];
  let upper = conversionTable[conversionTable.length - 1];

  for (let i = 0; i < conversionTable.length - 1; i++) {
    if (ghs >= conversionTable[i].ghs && ghs < conversionTable[i + 1].ghs) {
      lower = conversionTable[i];
      upper = conversionTable[i + 1];
      break;
    }
  }

  const ratio = (ghs - lower.ghs) / (upper.ghs - lower.ghs);
  const xc = lower.xc + ratio * (upper.xc - lower.xc);

  return Math.round(xc);
}

export async function POST(request: Request) {
  try {
    const { reference, amount, userId } = await request.json();

    const ghsAmount = parseFloat(amount);

    // Check if the amount is less than 10 GHS
    if (ghsAmount < 10) {
      return NextResponse.json({ 
        success: false, 
        message: 'Minimum deposit amount is 10 GHS' 
      }, { status: 400 });
    }

    // Check if this transaction has already been processed
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .single();

    if (existingTransaction) {
      return NextResponse.json({
        success: false,
        message: 'This transaction has already been processed'
      }, { status: 400 });
    }

    // Verify payment with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (paystackResponse.data.status !== true || paystackResponse.data.data.status !== 'success') {
      return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }

    const xcAmount = calculateXC(ghsAmount);

    // Use a transaction to ensure atomicity
    const { data, error } = await supabase.rpc('process_deposit', {
      p_user_id: userId,
      p_amount: xcAmount,
      p_ghs_amount: ghsAmount,
      p_reference: reference
    });

    if (error) {
      console.error('Error processing deposit:', error);
      return NextResponse.json({ success: false, message: 'Failed to process deposit' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and wallet updated successfully',
      xcAmount: xcAmount,
      newBalance: data.new_balance, 
    });

  } catch (error) {
    console.error('Error in payment verification process:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}