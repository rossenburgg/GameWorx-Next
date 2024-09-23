// components/GameChat.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ChatMessage {
  id: string;
  user_id: string;
  room_id: string;
  message: string;
  created_at: string;
}

interface GameChatProps {
  roomId: string;
}

const GameChat: React.FC<GameChatProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchCurrentUser();

    const channel = supabase
      .channel(`public:chat_messages:room_id=eq.${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prevMessages => [...prevMessages, newMessage]);
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: currentUserId,
        message: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-64">
      <div className="flex-grow overflow-y-auto mb-4 p-2 border rounded">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.user_id === currentUserId ? 'You' : 'Opponent'}:</strong> {msg.message}
            </div>
        ))}
      </div>
      <div className="flex">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow mr-2"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default GameChat;