// components/GameLobby.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { showToast } from '@/lib/utils'

interface GameRoom {
  id: string;
  game_id: string;
  creator_id: string;
  wager_amount: number;
  status: 'waiting' | 'in_progress' | 'completed';
}

interface GameLobbyProps {
  gameId: string;
  gameName: string;
  onJoinGame: (roomId: string, wagerAmount: number) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ gameId, gameName, onJoinGame }) => {
  const [rooms, setRooms] = useState<GameRoom[]>([])
  const [wagerAmount, setWagerAmount] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()

    const channel = supabase
      .channel(`public:game_rooms:game_id=eq.${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `game_id=eq.${gameId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRooms(prevRooms => [...prevRooms, payload.new as GameRoom])
        } else if (payload.eventType === 'DELETE') {
          setRooms(prevRooms => prevRooms.filter(room => room.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setRooms(prevRooms => prevRooms.map(room => room.id === payload.new.id ? { ...room, ...payload.new as GameRoom } : room))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  const fetchRooms = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('game_id', gameId)
      .eq('status', 'waiting')

    if (error) {
      console.error('Error fetching rooms:', error)
    } else {
      setRooms(data)
    }
    setLoading(false)
  }

  const createRoom = async () => {
    const amount = parseFloat(wagerAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('Invalid wager', 'Please enter a valid amount', 'destructive')
      return
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error fetching user:', userError)
      showToast('Error', 'User not authenticated', 'destructive')
      return
    }

    const { error } = await supabase
      .from('game_rooms')
      .insert({
        game_id: gameId,
        creator_id: user.id,
        wager_amount: amount,
        status: 'waiting'
      })

    if (error) {
      console.error('Error creating room:', error)
      showToast('Error', 'Failed to create game room', 'destructive')
    } else {
      showToast('Success', 'Game room created', 'default')
      setWagerAmount('')
    }
  }


  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{gameName} Lobby</h2>
      <div className="mb-4">
        <Input
          type="number"
          placeholder="Enter wager amount"
          value={wagerAmount}
          onChange={(e) => setWagerAmount(e.target.value)}
          className="mb-2"
        />
        <Button onClick={createRoom}>Create Game Room</Button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>Game Room</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Wager: {room.wager_amount} XCoin</p>
                <Button onClick={() => onJoinGame(room.id, room.wager_amount)} className="mt-2">
                  Join Game
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default GameLobby