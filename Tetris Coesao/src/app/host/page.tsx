'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, Users, Play, Pause, SkipForward, Square } from 'lucide-react';
import { useServerUrl } from '@/hooks/use-server-url';

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  lives: number;
  color: string;
  isHost: boolean;
  connected: boolean;
}

interface Room {
  id: string;
  code: string;
  status: 'lobby' | 'playing' | 'ended';
  currentRound: number;
  players: Player[];
  rounds: any[];
}

interface Round {
  id: string;
  text: string;
  options: string[];
  correctConnector: string;
  category: string;
}

export default function HostPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const joinUrlRef = useRef<HTMLInputElement>(null);
  
  const serverUrl = useServerUrl();

  useEffect(() => {
    if (!serverUrl) return;
    
    const socketInstance = io(serverUrl, {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Eventos do jogo
    socketInstance.on('roomCreated', ({ room, player }: { room: Room; player: Player }) => {
      setRoom(room);
      setPlayer(player);
    });

    socketInstance.on('gameStarted', ({ room, currentRound }: { room: Room; currentRound: Round }) => {
      setRoom(room);
      setCurrentRound(currentRound);
    });

    socketInstance.on('playerJoined', ({ player }: { player: Player }) => {
      if (room) {
        setRoom({
          ...room,
          players: [...room.players, player]
        });
      }
    });

    socketInstance.on('playerUpdated', ({ player }: { player: Player }) => {
      if (room) {
        setRoom({
          ...room,
          players: room.players.map(p => p.id === player.id ? player : p)
        });
      }
    });

    socketInstance.on('playerDisconnected', ({ player }: { player: Player }) => {
      if (room) {
        setRoom({
          ...room,
          players: room.players.map(p => p.id === player.id ? { ...p, connected: false } : p)
        });
      }
    });

    socketInstance.on('nextRound', ({ currentRound }: { currentRound: Round }) => {
      setCurrentRound(currentRound);
      if (room) {
        setRoom({ ...room, currentRound: room.currentRound + 1 });
      }
    });

    socketInstance.on('gameEnded', ({ room, ranking }: { room: Room; ranking: Player[] }) => {
      setRoom(room);
      setCurrentRound(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createRoom = () => {
    if (!playerName.trim()) return;
    socket?.emit('createRoom', { playerName });
  };

  const startGame = () => {
    if (!room) return;
    socket?.emit('startGame', { roomId: room.id });
  };

  const nextRound = () => {
    if (!room) return;
    socket?.emit('nextRound', { roomId: room.id });
  };

  const endGame = () => {
    if (!room) return;
    socket?.emit('endGame', { roomId: room.id });
  };

  const copyJoinUrl = () => {
    if (joinUrlRef.current) {
      joinUrlRef.current.select();
      document.execCommand('copy');
    }
  };

  const getProgressFromScore = (score: number) => {
    return Math.min(100, score * 0.02);
  };

  const getTopPlayers = () => {
    if (!room) return [];
    return [...room.players]
      .filter(p => p.connected)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Painel do Professor</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>

        {!room ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Criar Nova Sala</CardTitle>
              <CardDescription>
                Crie uma sala para que os alunos possam entrar e jogar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Seu Nome</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={createRoom} 
                disabled={!playerName.trim() || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Criar Sala
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Painel de Controle */}
            <div className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Sala {room.code}
                  </CardTitle>
                  <CardDescription>
                    Status: <Badge variant={room.status === 'lobby' ? 'secondary' : room.status === 'playing' ? 'default' : 'destructive'}>
                      {room.status === 'lobby' ? 'Aguardando' : room.status === 'playing' ? 'Jogando' : 'Encerrado'}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Link para Alunos</label>
                    <div className="flex gap-2">
                      <Input
                        ref={joinUrlRef}
                        value={`${window.location.origin}/player?room=${room.code}`}
                        readOnly
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Button size="icon" variant="outline" onClick={copyJoinUrl}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {room.status === 'lobby' && (
                      <Button onClick={startGame} className="flex-1 bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Jogo
                      </Button>
                    )}
                    {room.status === 'playing' && (
                      <>
                        <Button onClick={nextRound} className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <SkipForward className="w-4 h-4 mr-2" />
                          Próxima Rodada
                        </Button>
                        <Button onClick={endGame} variant="destructive" className="flex-1">
                          <Square className="w-4 h-4 mr-2" />
                          Encerrar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rodada Atual */}
              {currentRound && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Rodada {room.currentRound}</CardTitle>
                    <CardDescription>
                      Categoria: <Badge variant="outline">{currentRound.category}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg mb-4">
                      {currentRound.text.replace('__', '_____')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {currentRound.options.map((option, index) => (
                        <div key={index} className="bg-gray-700 p-2 rounded text-sm text-center">
                          {option}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Top 5 */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Top 5 Jogadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTopPlayers().map((player, index) => (
                      <div key={player.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{player.name}</span>
                            <span className="text-sm text-gray-400">{player.score} pts</span>
                          </div>
                          <Progress 
                            value={getProgressFromScore(player.score)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Todos os Jogadores */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Todos os Jogadores ({room.players.filter(p => p.connected).length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {room.players
                      .filter(p => p.connected)
                      .sort((a, b) => b.score - a.score)
                      .map((player) => (
                        <div key={player.id} className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: player.color }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">{player.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 rounded-full ${
                                        i < player.lives ? 'bg-red-500' : 'bg-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {player.score} pts
                                </span>
                              </div>
                            </div>
                            <Progress 
                              value={getProgressFromScore(player.score)} 
                              className="h-1"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}