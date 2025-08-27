import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Tipos de dados
interface Player {
  id: string;
  name: string;
  roomId: string;
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
  players: Map<string, Player>;
  rounds: Round[];
  createdAt: Date;
}

interface Round {
  id: string;
  text: string;
  options: string[];
  correctConnector: string;
  category: string;
}

interface Answer {
  playerId: string;
  roundId: string;
  answer: string;
  correct: boolean;
  responseTime: number;
  points: number;
}

interface GameState {
  rooms: Map<string, Room>;
  players: Map<string, Player>;
}

// Banco de dados em memória
const gameState: GameState = {
  rooms: new Map(),
  players: new Map(),
};

// Conectivos por categoria
const CONNECTIVES = {
  adicao: ['além disso', 'bem como', 'não só... como também', 'também', 'ademais'],
  alternancia: ['ou', 'quer... quer', 'ora... ora', 'já... já', 'seja... seja'],
  adversidade: ['mas', 'porém', 'contudo', 'todavia', 'entretanto'],
  sequencia: ['depois', 'em seguida', 'então', 'por fim', 'posteriormente'],
  causa: ['porque', 'pois', 'portanto', 'logo', 'por isso']
};

// Frases de exemplo
const SAMPLE_PHRASES = [
  { text: 'Estudei muito, __, tirei uma ótima nota.', category: 'causa', correct: 'logo' },
  { text: 'Posso ir de ônibus __ de metrô, depende do horário.', category: 'alternancia', correct: 'ou' },
  { text: 'Ele treinou pouco, __ não conseguiu completar a prova.', category: 'causa', correct: 'portanto' },
  { text: 'Gostamos do filme; __, a trilha sonora era ótima.', category: 'adicao', correct: 'além disso' },
  { text: 'Tentei avisar, __ você não atendeu ao telefone.', category: 'adversidade', correct: 'mas' },
  { text: 'Primeiro lave as mãos, __ comece a preparar os alimentos.', category: 'sequencia', correct: 'depois' },
  { text: 'Ela é inteligente, __ é muito preguiçosa.', category: 'adversidade', correct: 'porém' },
  { text: 'Vou ao cinema __ ao teatro, nunca aos dois.', category: 'alternancia', correct: 'ou' },
  { text: 'Choveu muito, __ as ruas ficaram alagadas.', category: 'causa', correct: 'por isso' },
  { text: 'Terminei o trabalho, __ vou descansar.', category: 'sequencia', correct: 'então' }
];

// Funções utilitárias
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateColor(): string {
  const colors = ['#23c4ff', '#ff7a59', '#ffd166', '#06d6a0', '#9b5de5', '#f15bb5', '#4cc9f0', '#fca311', '#3a86ff', '#8338ec'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function calculatePoints(responseTime: number, streak: number): number {
  const basePoints = 100;
  const timeBonus = Math.max(0, 50 - (responseTime / 12000) * 50); // 12 segundos limite
  const streakBonus = Math.min(3, streak) * 10;
  return Math.round(basePoints + timeBonus + streakBonus);
}

function getRandomOptions(correct: string, category: string): string[] {
  const categoryConnectives = CONNECTIVES[category as keyof typeof CONNECTIVES];
  const wrongOptions = categoryConnectives.filter(c => c !== correct);
  
  // Embaralha e pega 3 erradas
  const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
  const options = [correct, ...shuffled.slice(0, 3)];
  
  // Embaralha novamente
  return options.sort(() => Math.random() - 0.5);
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Criar sala
    socket.on('createRoom', ({ playerName }: { playerName: string }) => {
      const roomId = uuidv4();
      const roomCode = generateRoomCode();
      
      const room: Room = {
        id: roomId,
        code: roomCode,
        status: 'lobby',
        currentRound: 0,
        players: new Map(),
        rounds: [],
        createdAt: new Date()
      };

      // Criar jogador host
      const hostPlayer: Player = {
        id: socket.id,
        name: playerName,
        roomId,
        score: 0,
        streak: 0,
        lives: 3,
        color: generateColor(),
        isHost: true,
        connected: true
      };

      room.players.set(socket.id, hostPlayer);
      gameState.rooms.set(roomId, room);
      gameState.players.set(socket.id, hostPlayer);

      socket.join(roomId);
      socket.emit('roomCreated', { room: { ...room, players: Array.from(room.players.values()) }, player: hostPlayer });
    });

    // Entrar na sala
    socket.on('joinRoom', ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      const room = Array.from(gameState.rooms.values()).find(r => r.code === roomCode.toUpperCase());
      
      if (!room) {
        socket.emit('error', { message: 'Sala não encontrada' });
        return;
      }

      if (room.status !== 'lobby') {
        socket.emit('error', { message: 'A sala já está em jogo' });
        return;
      }

      const player: Player = {
        id: socket.id,
        name: playerName,
        roomId: room.id,
        score: 0,
        streak: 0,
        lives: 3,
        color: generateColor(),
        isHost: false,
        connected: true
      };

      room.players.set(socket.id, player);
      gameState.players.set(socket.id, player);

      socket.join(room.id);
      socket.emit('roomJoined', { room: { ...room, players: Array.from(room.players.values()) }, player });
      
      // Notificar outros jogadores
      socket.to(room.id).emit('playerJoined', { player });
    });

    // Iniciar jogo
    socket.on('startGame', ({ roomId }: { roomId: string }) => {
      const room = gameState.rooms.get(roomId);
      if (!room || room.status !== 'lobby') return;

      // Preparar rodadas
      const rounds: Round[] = SAMPLE_PHRASES.map((phrase, index) => ({
        id: uuidv4(),
        text: phrase.text,
        options: getRandomOptions(phrase.correct, phrase.category),
        correctConnector: phrase.correct,
        category: phrase.category
      }));

      room.rounds = rounds;
      room.status = 'playing';
      room.currentRound = 1;

      io.to(roomId).emit('gameStarted', { 
        room: { ...room, players: Array.from(room.players.values()), rounds },
        currentRound: rounds[0]
      });
    });

    // Enviar resposta
    socket.on('submitAnswer', ({ roomId, roundId, answer, responseTime }: { 
      roomId: string; 
      roundId: string; 
      answer: string; 
      responseTime: number; 
    }) => {
      const room = gameState.rooms.get(roomId);
      const player = gameState.players.get(socket.id);
      
      if (!room || !player || room.status !== 'playing') return;

      const round = room.rounds.find(r => r.id === roundId);
      if (!round) return;

      const correct = answer === round.correctConnector;
      const points = correct ? calculatePoints(responseTime, player.streak) : 0;
      
      // Atualizar jogador
      if (correct) {
        player.score += points;
        player.streak += 1;
      } else {
        player.lives -= 1;
        player.streak = 0;
      }

      // Notificar jogador
      socket.emit('answerResult', { 
        correct, 
        points, 
        streak: player.streak,
        lives: player.lives
      });

      // Notificar todos sobre atualização do jogador
      io.to(roomId).emit('playerUpdated', { player });

      // Verificar se o jogador perdeu
      if (player.lives <= 0) {
        socket.emit('gameOver', { finalScore: player.score });
      }

      // Verificar se todos responderam ou tempo esgotou
      const allAnswered = Array.from(room.players.values()).every(p => 
        !p.connected || p.lives <= 0
      );

      if (allAnswered) {
        nextRound(roomId);
      }
    });

    // Próxima rodada
    socket.on('nextRound', ({ roomId }: { roomId: string }) => {
      nextRound(roomId);
    });

    // Encerrar jogo
    socket.on('endGame', ({ roomId }: { roomId: string }) => {
      const room = gameState.rooms.get(roomId);
      if (!room) return;

      room.status = 'ended';
      const players = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
      
      io.to(roomId).emit('gameEnded', { 
        room: { ...room, players: Array.from(room.players.values()) },
        ranking: players
      });
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      const player = gameState.players.get(socket.id);
      if (player) {
        player.connected = false;
        const room = gameState.rooms.get(player.roomId);
        if (room) {
          io.to(player.roomId).emit('playerDisconnected', { player });
        }
      }
    });
  });

  function nextRound(roomId: string) {
    const room = gameState.rooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    room.currentRound += 1;
    
    if (room.currentRound > room.rounds.length) {
      // Fim do jogo
      room.status = 'ended';
      const players = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
      
      io.to(roomId).emit('gameEnded', { 
        room: { ...room, players: Array.from(room.players.values()) },
        ranking: players
      });
    } else {
      // Próxima rodada
      const currentRound = room.rounds[room.currentRound - 1];
      io.to(roomId).emit('nextRound', { 
        currentRound,
        roundNumber: room.currentRound
      });
    }
  }
};