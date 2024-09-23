// app/api/p2p-transfer/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: Request) {
  console.log('Received POST request for P2P transfer');
  try {
    const { recipientEmail, amount, senderId } = await request.json();
    console.log('Request body:', { recipientEmail, amount, senderId });

    // Get recipient user id from profiles table
    let { data: recipientData, error: recipientError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', recipientEmail)
      .single();

    console.log('Recipient query result:', { data: recipientData, error: recipientError });

    if (recipientError) {
      console.error('Error querying recipient:', recipientError);
      return NextResponse.json({ success: false, error: 'Error querying recipient' }, { status: 500 });
    }

    if (!recipientData) {
      console.error('Recipient not found in profiles');
      return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 });
    }

    const recipientId = recipientData.id;

    // Get sender's email
    let { data: senderData, error: senderError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', senderId)
      .single();

    if (senderError) {
      console.error('Error querying sender:', senderError);
      return NextResponse.json({ success: false, error: 'Error querying sender' }, { status: 500 });
    }

    // Perform the transfer
    const { data, error } = await supabase.rpc('transfer_xcoin', {
      p_sender_id: senderId,
      p_recipient_id: recipientId,
      p_amount: amount
    });

    console.log('Transfer result:', { data, error });

    if (error) {
      console.error('Error in P2P transfer:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Create notifications for both sender and recipient
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert([
        { 
          user_id: recipientId, 
          message: `You received ${amount} Xcoin from ${senderData.email}` 
        },
        { 
          user_id: senderId, 
          message: `You sent ${amount} Xcoin to ${recipientEmail}` 
        }
      ]);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // We don't return here because the transfer was successful
    }

    console.log('P2P transfer and notifications completed successfully');
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error in P2P transfer process:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}