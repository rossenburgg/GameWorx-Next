"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'
import { useBalance } from '@/contexts/BalanceContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import TicTacToe from '@/components/TicTacToe'
import GameLobby from '@/components/GameLobby'
import GameChat from '@/components/GameChat'
import { showToast } from '@/lib/utils'

interface Game {
  id: string;
  name: string;
  description: string;
  onlinePlayers: number;
}

interface GameRoom {
  id: string;
  creator_id: string;
  player2_id: string | null;
  wager_amount: number;
  status: 'waiting' | 'in_progress' | 'completed';
  current_player: string;
}

export default function P2PGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const { balance, updateBalance } = useBalance()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [currentWager, setCurrentWager] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null)
  const [playerId, setPlayerId] = useState<string>('')
  const [creatorName, setCreatorName] = useState('Loading...')
  const [player2Name, setPlayer2Name] = useState('Waiting...')

  useEffect(() => {
    fetchCurrentUser()
    fetchGames()
    checkForActiveGame()
  }, [])

  useEffect(() => {
    if (currentRoom) {
      getPlayerName(currentRoom.creator_id).then(setCreatorName)
      if (currentRoom.player2_id) {
        getPlayerName(currentRoom.player2_id).then(setPlayer2Name)
      }
    }
  }, [currentRoom])

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setPlayerId(user.id)

      // Update or create user profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          username: user.email?.split('@')[0] || 'user',
          display_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating user profile:', error)
      }
    }
  }

  const fetchGames = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('games').select('*')
    if (error) {
      console.error('Error fetching games:', error)
    } else {
      setGames(data)
    }
    setLoading(false)
  }

  const checkForActiveGame = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No authenticated user found')
      return
    }

    console.log('Checking for active game for user:', user.id)

    const { data, error } = await supabase
      .from('game_rooms')
      .select('*, games(*)')
      .or(`creator_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq('status', 'in_progress')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No active game found for the user')
      } else {
        console.error('Error checking for active game:', error)
      }
    } else if (data) {
      console.log('Active game found:', data)
      setSelectedGame(data.games)
      setCurrentRoomId(data.id)
      setCurrentWager(data.wager_amount)
      setIsPlaying(true)
      setCurrentRoom(data)
    } else {
      console.log('No active game data returned')
    }
  }

  const handleJoinGame = async (roomId: string, wagerAmount: number) => {
    
    if (wagerAmount > balance) {
      showToast('Insufficient balance', 'You do not have enough XCoin to join this game', 'destructive')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Error', 'User not authenticated', 'destructive')
      return
    }

    console.log('Joining game:', roomId, 'with wager:', wagerAmount)

    const { data, error } = await supabase
      .from('game_rooms')
      .update({ 
        player2_id: user.id, 
        status: 'in_progress',
        current_player: user.id  // Set the initial player to the one who joined
      })
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      console.error('Error joining game:', error)
      showToast('Error', 'Failed to join game', 'destructive')
    } else if (data) {
      console.log('Successfully joined game:', data)
      setCurrentRoomId(roomId)
      setCurrentWager(wagerAmount)
      setIsPlaying(true)
      setCurrentRoom(data)

      // Deduct wager amount immediately
      const newBalance = balance - wagerAmount
      updateBalance(newBalance)
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id)

      if (walletError) {
        console.error('Error updating wallet:', walletError)
      }

      // Fetch and update player names
      const creatorName = await getPlayerName(data.creator_id)
      const player2Name = await getPlayerName(user.id)
      setCreatorName(creatorName)
      setPlayer2Name(player2Name)
    } else {
      console.error('No data returned when joining game')
      showToast('Error', 'Failed to join game', 'destructive')
    }
  }

  const handleGameEnd = async (result: 'win' | 'lose' | 'draw') => {
    if (!currentRoom) return

    let winnerUserId: string | null = null
    let loserUserId: string | null = null

    if (result === 'win') {
      winnerUserId = playerId
      loserUserId = currentRoom.creator_id === playerId ? currentRoom.player2_id : currentRoom.creator_id
      showToast('Congratulations!', `You won ${currentWager} XCoin!`, 'default')
    } else if (result === 'lose') {
      loserUserId = playerId
      winnerUserId = currentRoom.creator_id === playerId ? currentRoom.player2_id : currentRoom.creator_id
      showToast('Better luck next time', `You lost ${currentWager} XCoin`, 'destructive')
    } else {
      showToast('It\'s a draw!', 'Your wager has been returned', 'default')
    }

    if (winnerUserId && loserUserId) {
      // Update winner's balance
      const { data: winnerData, error: winnerError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', winnerUserId)
        .single()

      if (winnerError) {
        console.error('Error fetching winner balance:', winnerError)
      } else if (winnerData) {
        const newWinnerBalance = winnerData.balance + currentWager * 2
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ balance: newWinnerBalance })
          .eq('user_id', winnerUserId)

        if (updateError) {
          console.error('Error updating winner balance:', updateError)
        } else if (winnerUserId === playerId) {
          updateBalance(newWinnerBalance)
        }
      }

      // No need to update loser's balance as it was already deducted when joining the game
    } else if (result === 'draw') {
      // Return wager to both players in case of a draw
      const players = [currentRoom.creator_id, currentRoom.player2_id]
      for (const player of players) {
        if (player) {
          const { data: playerData, error: playerError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', player)
            .single()

          if (playerError) {
            console.error('Error fetching player balance:', playerError)
          } else if (playerData) {
            const newBalance = playerData.balance + currentWager
            const { error: updateError } = await supabase
              .from('wallets')
              .update({ balance: newBalance })
              .eq('user_id', player)

            if (updateError) {
              console.error('Error updating player balance:', updateError)
            } else if (player === playerId) {
              updateBalance(newBalance)
            }
          }
        }
      }
    }

    // Update game room status
    const { error: roomUpdateError } = await supabase
      .from('game_rooms')
      .update({ status: 'completed', result: result === 'draw' ? 'draw' : winnerUserId })
      .eq('id', currentRoomId)

    if (roomUpdateError) {
      console.error('Error updating game room status:', roomUpdateError)
    }

    endGame()
  }

  const endGame = () => {
    setIsPlaying(false)
    setSelectedGame(null)
    setCurrentRoomId(null)
    setCurrentWager(0)
    setCurrentRoom(null)
  }

  const getPlayerName = async (userId: string) => {
    if (userId === playerId) return 'You'

    const { data, error } = await supabase
      .from('user_profiles')
      .select('username, display_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return 'Unknown Player'
    }

    return data.display_name || data.username || 'Unknown Player'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">P2P Games</h1>
        <p className="mb-4">Your balance: {balance.toFixed(2)} XCoin</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isPlaying && selectedGame && currentRoom) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{selectedGame.name}</h1>
        <p className="mb-4">Wager: {currentWager} XCoin</p>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 mb-4 md:mb-0 md:mr-4">
            <TicTacToe 
              roomId={currentRoomId!}
              playerId={playerId}
              onGameEnd={handleGameEnd}
              onEndGame={endGame}
            />
          </div>
          <div className="md:w-1/2">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Creator: {currentRoom.creator_id === playerId ? 'You' : creatorName}</p>
                <p>
                  Player 2: {
                    currentRoom.player2_id 
                      ? (currentRoom.player2_id === playerId 
                          ? 'You' 
                          : player2Name)
                      : 'Waiting...'
                  }
                </p>
              </CardContent>
            </Card>
            <GameChat roomId={currentRoomId!} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">P2P Games</h1>
      <p className="mb-4">Your balance: {balance.toFixed(2)} XCoin</p>
      {selectedGame ? (
        <GameLobby 
          gameId={selectedGame.id} 
          gameName={selectedGame.name} 
          onJoinGame={handleJoinGame} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card key={game.id}>
              <CardHeader>
                <CardTitle>{game.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{game.description}</p>
                <p className="mt-2">Online players: {game.onlinePlayers}</p>
                <Button onClick={() => setSelectedGame(game)} className="mt-4">Select Game</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}