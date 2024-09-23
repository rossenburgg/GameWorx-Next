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
  try {
    const { itemId, userId } = await request.json();

    // Fetch the item
    const { data: item, error: itemError } = await supabase
      .from('store_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError) {
      console.error('Error fetching item:', itemError);
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Check user's balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      return NextResponse.json({ success: false, error: 'Error fetching wallet' }, { status: 500 });
    }

    if (wallet.balance < item.price) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    // Perform the purchase
    const { data, error } = await supabase.rpc('purchase_item', {
      p_user_id: userId,
      p_item_id: itemId,
      p_price: item.price
    });

    if (error) {
      console.error('Error in purchase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Create a notification for the purchase
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: `You purchased ${item.name} for ${item.price} Xcoin`
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error in purchase process:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}