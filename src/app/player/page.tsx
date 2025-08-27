'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Trophy, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSoundEffects } from '@/hooks/use-sound-effects';
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

interface FallingBlock {
  id: string;
  text: string;
  options: string[];
  correctConnector: string;
  category: string;
  y: number;
  speed: number;
}

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const roomCodeFromUrl = searchParams.get('room') || '';
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(roomCodeFromUrl);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'ended'>('lobby');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [particles, setParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, life: number, color: string}>>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const fallingBlockRef = useRef<FallingBlock | null>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  
  const { playCorrectSound, playWrongSound, playGameOverSound, playTickSound } = useSoundEffects();
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
    socketInstance.on('roomJoined', ({ room, player }: { room: Room; player: Player }) => {
      setRoom(room);
      setPlayer(player);
      setGameState(room.status);
    });

    socketInstance.on('gameStarted', ({ room, currentRound }: { room: Room; currentRound: Round }) => {
      setRoom(room);
      setCurrentRound(currentRound);
      setGameState('playing');
      setRoundStartTime(Date.now());
      startFallingBlock(currentRound);
    });

    socketInstance.on('nextRound', ({ currentRound }: { currentRound: Round }) => {
      setCurrentRound(currentRound);
      setRoundStartTime(Date.now());
      setSelectedAnswer(null);
      setFeedback({ type: null, message: '' });
      startFallingBlock(currentRound);
    });

    socketInstance.on('answerResult', ({ correct, points, streak, lives }: { 
      correct: boolean; 
      points: number; 
      streak: number; 
      lives: number; 
    }) => {
      if (correct) {
        playCorrectSound();
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          createParticles(rect.width / 2, rect.height / 2, '#10b981', 30);
        }
      } else {
        playWrongSound();
      }
      
      setFeedback({
        type: correct ? 'success' : 'error',
        message: correct ? `✔ Correto! +${points} pontos (streak ${streak})` : '✖ Incorreto!'
      });
      
      if (player) {
        setPlayer({ ...player, score: player.score + points, streak, lives });
      }
      
      stopFallingBlock();
    });

    socketInstance.on('playerUpdated', ({ player: updatedPlayer }: { player: Player }) => {
      if (updatedPlayer.id === player?.id) {
        setPlayer(updatedPlayer);
      }
    });

    socketInstance.on('gameEnded', ({ room, ranking }: { room: Room; ranking: Player[] }) => {
      setRoom(room);
      setGameState('ended');
      setCurrentRound(null);
      stopFallingBlock();
    });

    socketInstance.on('gameOver', ({ finalScore }: { finalScore: number }) => {
      playGameOverSound();
      setGameState('ended');
      setFeedback({
        type: 'error',
        message: `Game Over! Pontuação final: ${finalScore}`
      });
      stopFallingBlock();
    });

    socketInstance.on('error', ({ message }: { message: string }) => {
      setFeedback({ type: 'error', message });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && roundStartTime > 0) {
      const timer = setInterval(() => {
        const elapsed = Date.now() - roundStartTime;
        const remaining = Math.max(0, 12000 - elapsed); // 12 segundos por rodada
        setTimeLeft(remaining);
        
        // Tocar som de tick quando tiver menos de 3 segundos
        if (remaining <= 3000 && remaining > 0 && remaining % 1000 < 100) {
          playTickSound();
        }
        
        if (remaining === 0) {
          // Tempo esgotado
          handleAnswer('');
        }
      }, 100);

      return () => clearInterval(timer);
    }
  }, [gameState, roundStartTime]);

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    socket?.emit('joinRoom', { roomCode: roomCode.toUpperCase(), playerName });
  };

  const handleAnswer = (answer: string) => {
    if (!currentRound || !player || selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const responseTime = Date.now() - roundStartTime;
    
    socket?.emit('submitAnswer', {
      roomId: room?.id,
      roundId: currentRound.id,
      answer,
      responseTime
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number = 20) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const animateParticles = () => {
    setParticles(prev => {
      const updated = prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.1, // gravidade
        life: p.life - 0.02
      })).filter(p => p.life > 0);

      // Desenhar partículas
      if (particlesRef.current) {
        const ctx = particlesRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, particlesRef.current.width, particlesRef.current.height);
          updated.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      return updated;
    });

    if (particles.length > 0) {
      requestAnimationFrame(animateParticles);
    }
  };

  useEffect(() => {
    if (particles.length > 0) {
      animateParticles();
    }
  }, [particles]);

  const startFallingBlock = (round: Round) => {
    fallingBlockRef.current = {
      id: round.id,
      text: round.text,
      options: round.options,
      correctConnector: round.correctConnector,
      category: round.category,
      y: 0,
      speed: 0.5 + (player?.streak || 0) * 0.1
    };
    
    animateFallingBlock();
  };

  const stopFallingBlock = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    fallingBlockRef.current = null;
  };

  const animateFallingBlock = () => {
    if (!fallingBlockRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualizar posição
    fallingBlockRef.current.y += fallingBlockRef.current.speed;

    // Desenhar bloco
    const block = fallingBlockRef.current;
    const blockWidth = canvas.width - 40;
    const blockHeight = 80;
    const x = 20;
    const y = block.y;

    // Background do bloco
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, y, blockWidth, blockHeight);
    
    // Border do bloco
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, blockWidth, blockHeight);

    // Texto da frase
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    const text = block.text.replace('__', '_____');
    ctx.fillText(text, canvas.width / 2, y + 30);

    // Categoria
    ctx.fillStyle = '#60a5fa';
    ctx.font = '12px system-ui';
    ctx.fillText(block.category, canvas.width / 2, y + 50);

    // Verificar se o bloco chegou ao fim
    if (block.y > canvas.height) {
      handleAnswer('');
      return;
    }

    animationRef.current = requestAnimationFrame(animateFallingBlock);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      adicao: 'bg-blue-500',
      alternancia: 'bg-green-500',
      adversidade: 'bg-red-500',
      sequencia: 'bg-yellow-500',
      causa: 'bg-purple-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <CardTitle>Jogo Encerrado!</CardTitle>
            <CardDescription>
              {player && `Sua pontuação final: ${player.score} pontos`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Jogar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Conectivos em Queda</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>

        {!room ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Entrar na Sala</CardTitle>
              <CardDescription>
                Digite o código da sala e seu nome para começar a jogar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Código da Sala</label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Seu Nome</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              {feedback.message && (
                <div className={`p-3 rounded ${
                  feedback.type === 'error' ? 'bg-red-900/50 border-red-700' : 'bg-green-900/50 border-green-700'
                }`}>
                  {feedback.message}
                </div>
              )}
              <Button 
                onClick={joinRoom} 
                disabled={!playerName.trim() || !roomCode.trim() || !isConnected}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Entrar na Sala
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Status do Jogador */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player?.name}</span>
                      <Badge variant="outline">{room.code}</Badge>
                    </div>
                    <div className="text-sm text-gray-400">
                      Pontuação: {player?.score} | Streak: {player?.streak}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`w-5 h-5 ${
                            i < (player?.lives || 0) ? 'text-red-500 fill-red-500' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Área do Jogo */}
            {gameState === 'playing' && currentRound && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={getCategoryColor(currentRound.category)}>
                        {currentRound.category}
                      </Badge>
                      Rodada {room.currentRound}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {Math.ceil(timeLeft / 1000)}s
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Canvas para animação do bloco caindo */}
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      className="w-full h-48 bg-gray-900 rounded-lg"
                    />
                    <canvas
                      ref={particlesRef}
                      width={400}
                      height={200}
                      className="absolute top-0 left-0 w-full h-48 pointer-events-none"
                      style={{ mixBlendMode: 'screen' }}
                    />
                  </div>

                  {/* Frase */}
                  <div className="text-center">
                    <p className="text-lg mb-4">
                      {currentRound.text.replace('__', '_____')}
                    </p>
                  </div>

                  {/* Opções de resposta */}
                  <div className="grid grid-cols-2 gap-3">
                    {currentRound.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={selectedAnswer !== null}
                        variant={selectedAnswer === option ? 'default' : 'outline'}
                        className={`h-16 text-lg ${
                          selectedAnswer === option 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                        }`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>

                  {/* Feedback */}
                  {feedback.message && (
                    <div className={`p-4 rounded-lg text-center ${
                      feedback.type === 'success' 
                        ? 'bg-green-900/50 border border-green-700 text-green-300' 
                        : 'bg-red-900/50 border border-red-700 text-red-300'
                    }`}>
                      {feedback.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Aguardando início */}
            {gameState === 'lobby' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">⏳</div>
                  <h3 className="text-xl font-semibold mb-2">Aguardando Início</h3>
                  <p className="text-gray-400">
                    O professor iniciará o jogo em breve...
                  </p>
                  <div className="mt-4">
                    <Badge variant="outline">
                      Jogadores na sala: {room.players.filter(p => p.connected).length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}