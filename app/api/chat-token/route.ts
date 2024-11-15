// app/api/chat-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StreamChat } from 'stream-chat'
import { createClient } from '@supabase/supabase-js'

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!
const API_SECRET = process.env.STREAM_API_SECRET!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serverClient = StreamChat.getInstance(API_KEY, API_SECRET)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { userId, username } = await request.json()
    
    if (typeof userId !== 'string' || typeof username !== 'string') {
      return NextResponse.json({ error: 'userId and username are required' }, { status: 400 })
    }

    // Check if we already have a profile for this user
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stream_chat_id')
      .eq('id', userId)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, stream_chat_id: `stream_${userId}` })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError)
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
        }

        profile = newProfile
      } else {
        console.error('Error fetching profile:', profileError)
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    let streamChatId = profile.stream_chat_id;
    
    if (!streamChatId) {
      streamChatId = `stream_${userId}`;
      
      // Update the profile with the new Stream Chat ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stream_chat_id: streamChatId })
        .eq('id', userId);
    
      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
      }
    }
    // Upsert the user in Stream Chat
    try {
      await serverClient.upsertUser({
        id: streamChatId,
        name: username,
        role: 'user',
      })
    } catch (error) {
      console.error('Error upserting user in Stream Chat:', error)
      return NextResponse.json({ error: 'Failed to create/update user in chat system' }, { status: 500 })
    }

    // Generate a token for the Stream Chat user
    const token = serverClient.createToken(streamChatId)

    return NextResponse.json({ token, streamChatId })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}