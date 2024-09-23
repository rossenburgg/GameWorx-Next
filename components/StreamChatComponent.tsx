// components/StreamChatComponent.tsx
import React, { useEffect, useState } from 'react'
import { StreamChat, Channel as StreamChannel } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'

const chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!)

interface StreamChatComponentProps {
  user: {
    id: string
    name: string
    image?: string
  }
}

export function StreamChatComponent({ user, onClose }: StreamChatComponentProps) {
    const [channel, setChannel] = useState<StreamChannel | null>(null)
  const [clientReady, setClientReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const setupChat = async () => {
      try {
        const response = await fetch('/api/chat-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, username: user.name }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get chat token')
        }

        const { token, streamChatId } = await response.json()

        await chatClient.connectUser(
          {
            id: streamChatId,
            name: user.name,
            image: user.image,
          },
          token
        )

        const generalChannel = chatClient.channel('messaging', 'general', {
          name: 'General Chat',
          members: [streamChatId],
        })

        try {
          await generalChannel.watch()
        } catch (error) {
          console.error('Error watching channel:', error)
          if (error.code === 4) {
            console.log('Attempting to create channel...')
            await generalChannel.create()
          } else {
            throw error
          }
        }

        setChannel(generalChannel)
        setClientReady(true)
      } catch (error) {
        console.error('Error setting up chat:', error)
        if (error.response) {
          console.error('Error response:', error.response.data)
        }
        setError(error instanceof Error ? error.message : 'Failed to set up chat')
      }
    }

    setupChat()

    return () => {
      chatClient.disconnectUser()
    }
  }, [user])


  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!clientReady) return <div>Loading chat...</div>

  return (
    <div className="relative h-full">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-gray-700 p-2 rounded-full md:hidden"
        >
          <FaTimes className="text-white" />
        </button>
      )}
      <Chat client={chatClient} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}