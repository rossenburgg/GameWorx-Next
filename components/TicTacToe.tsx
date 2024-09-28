import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"

interface TicTacToeProps {
  roomId: string;
  playerId: string;
  onGameEnd: (result: 'win' | 'lose' | 'draw') => void;
  onEndGame: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ roomId, playerId, onGameEnd, onEndGame }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  
  const isPlayerTurn = useMemo(() => {
    const xCount = board.filter(cell => cell === 'X').length;
    const oCount = board.filter(cell => cell === 'O').length;
    return (playerSymbol === 'X' && xCount === oCount) || (playerSymbol === 'O' && xCount > oCount);
  }, [board, playerSymbol]);

useEffect(() => {
  const subscription = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` }, payload => {
      console.log('Received game update:', payload.new);
      setBoard(payload.new.board);
      setCurrentTurn(payload.new.current_turn);
      
      if (payload.new.status === 'completed' && !gameEnded) {
        setGameEnded(true);
        const result = payload.new.result === playerId ? 'win' : (payload.new.result === 'draw' ? 'draw' : 'lose');
        onGameEnd(result);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, [roomId, playerId, onGameEnd, gameEnded]);

  useEffect(() => {
    const fetchGameState = async () => {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('Error fetching game state:', error);
      } else {
        console.log('Fetched game state:', data);
        setBoard(data.board || Array(9).fill(null));
        setCreatorId(data.creator_id);
        setPlayerSymbol(data.creator_id === playerId ? 'X' : 'O');
      }
    };

    fetchGameState();

    const subscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` }, payload => {
        console.log('Received game update:', payload.new);
        setBoard(payload.new.board);
        
        if (payload.new.result) {
          const result = payload.new.result === playerId ? 'win' : (payload.new.result === 'draw' ? 'draw' : 'lose');
          onGameEnd(result);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId, playerId, onGameEnd]);

  const handleClick = async (i: number) => {
    if (!isPlayerTurn || board[i] || gameEnded) return;

    const newBoard = [...board];
    newBoard[i] = playerSymbol;

    const winner = calculateWinner(newBoard);
    const isDraw = !newBoard.includes(null);

    console.log('Updating game state:', { board: newBoard, winner, isDraw });

    const { error } = await supabase
      .from('game_rooms')
      .update({
        board: newBoard,
        result: winner ? playerId : (isDraw ? 'draw' : null)
      })
      .eq('id', roomId);

    if (error) {
      console.error('Error updating game state:', error);
    } else {
      setBoard(newBoard);
    }
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const renderSquare = (i: number) => (
    <Button 
      onClick={() => handleClick(i)} 
      className="h-16 w-16 text-2xl"
      disabled={!isPlayerTurn || board[i] !== null || gameEnded}
    >
      {board[i]}
    </Button>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <div className="flex">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="flex">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="flex">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
      <p className="text-lg font-semibold mb-4">
        {gameEnded ? "Game Over" : (isPlayerTurn ? "Your turn" : "Opponent's turn")}
      </p>
      <p className="text-md mb-4">
        You are playing as: {playerSymbol}
      </p>
      <Button onClick={onEndGame} className="bg-red-500 hover:bg-red-600 text-white">
        End Game
      </Button>
    </div>
  );
};

export default TicTacToe;