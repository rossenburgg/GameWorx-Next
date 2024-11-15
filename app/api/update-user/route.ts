import { NextRequest, NextResponse } from 'next/server'
import { StreamChat } from 'stream-chat'

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!
const API_SECRET = process.env.STREAM_API_SECRET!

const serverClient = StreamChat.getInstance(API_KEY, API_SECRET)

export async function POST(request: NextRequest) {
  try {
    const { userId, username } = await request.json()
    
    if (typeof userId !== 'string' || typeof username !== 'string') {
      return NextResponse.json({ error: 'userId and username are required' }, { status: 400 })
    }

    // Force update the user
    await serverClient.partialUpdateUser({
      id: userId,
      set: {
        name: username,
        role: 'user',
        deleted_at: undefined // Changed from null to undefined
      }
    })

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}