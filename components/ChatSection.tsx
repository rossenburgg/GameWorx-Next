// components/ChatSection.tsx
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  user_id: string
  content: string
  created_at: string
  user: {
    email: string
    user_metadata: {
      avatar_url?: string
      full_name?: string
    }
  }
}

interface ChatSectionProps {
  currentUser: any
}

export function ChatSection({ currentUser }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prevMessages => [...prevMessages, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        user_id,
        content,
        created_at,
        users:user_id (
          email,
          user_metadata
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)
  
    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data.reverse())
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: currentUser.id,
        content: newMessage.trim()
      })
      .select()

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-2 mb-4">
            <Avatar>
              <AvatarImage src={message.user.user_metadata.avatar_url} />
              <AvatarFallback>{message.user.user_metadata.full_name?.[0] || message.user.email[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{message.user.user_metadata.full_name || message.user.email}</p>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={sendMessage} className="mt-4 flex space-x-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}