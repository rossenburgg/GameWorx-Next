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
import { debounce } from 'lodash';
import Image from 'next/image'

interface Game {
  id: string;
  name: string;
  description: string;
  onlinePlayers: number;
  imageUrl: string;
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
    const debouncedHandleGameEnd = debounce(handleGameEnd, 1000, { leading: true, trailing: false });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Error', 'User not authenticated', 'destructive');
        return;
      }
  
      // Fetch current balance
      const { data: currentWallet, error: fetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
  
      if (fetchError || !currentWallet) {
        console.error('Error fetching wallet:', fetchError);
        showToast('Error', 'Failed to fetch wallet', 'destructive');
        return;
      }
  
      if (currentWallet.balance < wagerAmount) {
        showToast('Insufficient balance', 'You do not have enough XCoin to join this game', 'destructive');
        return;
      }
  
      const newBalance = balance - wagerAmount;
  const { error: walletUpdateError } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', user.id);

  if (walletUpdateError) {
    console.error('Error updating wallet:', walletUpdateError);
    showToast('Error', 'Failed to update wallet', 'destructive');
    return;
  }

  // Update local balance state
  updateBalance(newBalance);
  
      // Join the game room
      const { data, error } = await supabase
        .from('game_rooms')
        .update({ 
          player2_id: user.id, 
          status: 'in_progress'
        })
        .eq('id', roomId)
        .select()
        .single();
  
      if (error) {
        console.error('Error joining game:', error);
        showToast('Error', 'Failed to join game', 'destructive');
        return;
      }
  
      console.log('Successfully joined game:', data);
      setCurrentRoomId(roomId);
      setCurrentWager(wagerAmount);
      setIsPlaying(true);
      setCurrentRoom(data);
  
      showToast('Success', `You've joined the game and wagered ${wagerAmount} XCoin`, 'default');
    } catch (error) {
      console.error('Unexpected error in handleJoinGame:', error);
      showToast('Error', 'An unexpected error occurred', 'destructive');
    }
  };
  
  const handleGameEnd = async (result: 'win' | 'lose' | 'draw') => {
    try {
      if (!currentRoom) {
        console.error('No current room found');
        return;
      }
  
      console.log('Game ended. Result:', result);
      console.log('Current room:', currentRoom);
      console.log('Current wager:', currentWager);
  
      if (result === 'win') {
        // Fetch current balance for winner
        const { data: winnerWallet, error: fetchError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', playerId)
          .single();
  
        if (fetchError || !winnerWallet) {
          console.error('Error fetching winner wallet:', fetchError);
          return;
        }
  
        console.log('Winner\'s current balance:', winnerWallet.balance);
  
        const winningAmount = currentWager;
        const newWinnerBalance = winnerWallet.balance + winningAmount;
  
        console.log('Winning amount:', winningAmount);
        console.log('New balance for winner:', newWinnerBalance);
  
        // Update winner's wallet in database
        const { error: winnerUpdateError } = await supabase
          .from('wallets')
          .update({ balance: newWinnerBalance })
          .eq('user_id', playerId);
  
        if (winnerUpdateError) {
          console.error('Error updating winner\'s wallet:', winnerUpdateError);
          return;
        }
  
        console.log('Winner\'s wallet updated successfully');
  
        // Update local balance state
        updateBalance(newWinnerBalance);
        showToast('Congratulations!', `You won ${winningAmount} XCoin!`, 'default');
      } else if (result === 'lose') {
        showToast('Better luck next time', `You lost ${currentWager} XCoin`, 'destructive');
      } else {
        showToast('It\'s a draw!', 'No XCoin was exchanged', 'default');
      }
  
      endGame();
    } catch (error) {
      console.error('Unexpected error in handleGameEnd:', error);
      showToast('Error', 'An unexpected error occurred', 'destructive');
    }
  };

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
        <Skeleton className="h-8 w-48 mb-4" /> {/* P2P Games title */}
        <Skeleton className="h-6 w-64 mb-4" /> {/* Balance */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" /> {/* Game title */}
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <Skeleton className="w-full h-40 mb-2" /> {/* Image skeleton */}
                <Skeleton className="h-4 w-full mb-2" /> {/* Description line 1 */}
                <Skeleton className="h-4 w-3/4 mb-2" /> {/* Description line 2 */}
                <Skeleton className="h-4 w-1/2 mb-4" /> {/* Online players */}
                <Skeleton className="h-10 w-full mt-auto" /> {/* Button */}
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{game.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="relative w-full h-40 mb-2">
                  <Image
                    src={game.imageUrl}
                    alt={game.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <p className="mb-2">{game.description}</p>
                <p className="mb-2">Online players: {game.onlinePlayers}</p>
                <Button onClick={() => setSelectedGame(game)} className="mt-auto">
                  Select Game
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}