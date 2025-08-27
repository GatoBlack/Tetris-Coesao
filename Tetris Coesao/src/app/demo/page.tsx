'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Users } from 'lucide-react';

// Dados mockados para demonstração
const MOCK_ROOMS = [
  { id: '1', code: 'ABC123', players: 5, status: 'playing' },
  { id: '2', code: 'DEF456', players: 3, status: 'lobby' },
  { id: '3', code: 'GHI789', players: 8, status: 'playing' },
];

const MOCK_QUESTIONS = [
  {
    id: '1',
    text: 'Estudei muito, __, tirei uma ótima nota.',
    options: ['logo', 'mas', 'além disso', 'ou'],
    correct: 'logo',
    category: 'causa'
  },
  {
    id: '2',
    text: 'Posso ir de ônibus __ de metrô, depende do horário.',
    options: ['porque', 'ou', 'logo', 'porém'],
    correct: 'ou',
    category: 'alternancia'
  },
  {
    id: '3',
    text: 'Ele treinou pouco, __ não conseguiu completar a prova.',
    options: ['portanto', 'contudo', 'pois', 'logo'],
    correct: 'portanto',
    category: 'causa'
  }
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState<'menu' | 'host' | 'player' | 'game'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleAnswer = (answer: string) => {
    const question = MOCK_QUESTIONS[currentQuestion];
    const isCorrect = answer === question.correct;
    
    if (isCorrect) {
      setScore(score + 100);
      setFeedback({ type: 'success', message: '✔ Correto! +100 pontos' });
    } else {
      setLives(lives - 1);
      setFeedback({ type: 'error', message: '✖ Incorreto!' });
    }

    setTimeout(() => {
      if (currentQuestion < MOCK_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setFeedback({ type: null, message: '' });
      } else {
        // Fim do jogo
        setCurrentStep('menu');
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
    setFeedback({ type: null, message: '' });
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

  if (currentStep === 'game') {
    const question = MOCK_QUESTIONS[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Conectivos em Queda</h1>
              <p className="text-gray-400">Modo Demonstração</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Pontuação</div>
                <div className="text-xl font-bold">{score}</div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${
                      i < lives ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Badge className={getCategoryColor(question.category)}>
                    {question.category}
                  </Badge>
                  Questão {currentQuestion + 1}/{MOCK_QUESTIONS.length}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-xl mb-6">
                  {question.text.replace('__', '_____')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={feedback.type !== null}
                    className="h-16 text-lg bg-gray-700 hover:bg-gray-600 border-gray-600"
                  >
                    {option}
                  </Button>
                ))}
              </div>

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

          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentStep('menu');
                resetGame();
              }}
            >
              Voltar ao Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Conectivos em Queda
          </h1>
          <p className="text-xl text-blue-200 mb-4">
            Versão Demonstração (Offline)
          </p>
          <p className="text-sm text-gray-400">
            Esta versão não requer conexão com servidor e serve para demonstração
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all cursor-pointer"
                onClick={() => setCurrentStep('host')}>
            <CardHeader className="text-center">
              <Users className="w-16 h-16 mx-auto text-blue-400 mb-4" />
              <CardTitle className="text-2xl text-white">Professor</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie salas e acompanhe o progresso dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Acessar Painel
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all cursor-pointer"
                onClick={() => setCurrentStep('player')}>
            <CardHeader className="text-center">
              <Play className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <CardTitle className="text-2xl text-white">Aluno</CardTitle>
              <CardDescription className="text-gray-400">
                Jogue e aprenda conectivos gramaticais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Jogar Agora
              </Button>
            </CardContent>
          </Card>
        </div>

        {currentStep === 'host' && (
          <Card className="mt-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Painel do Professor (Demo)</CardTitle>
              <CardDescription>
                Salas ativas e jogadores conectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Salas Ativas</h3>
                {MOCK_ROOMS.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-4 bg-gray-700 rounded">
                    <div>
                      <span className="font-mono text-lg">{room.code}</span>
                      <div className="text-sm text-gray-400">
                        {room.players} jogadores
                      </div>
                    </div>
                    <Badge variant={room.status === 'playing' ? 'default' : 'secondary'}>
                      {room.status === 'playing' ? 'Jogando' : 'Aguardando'}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={() => setCurrentStep('menu')}
                  variant="outline"
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'player' && (
          <Card className="mt-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Entrar no Jogo</CardTitle>
              <CardDescription>
                Digite o código da sala para começar
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
              
              <Button 
                onClick={() => {
                  if (roomCode && playerName) {
                    setCurrentStep('game');
                    resetGame();
                  }
                }}
                disabled={!roomCode || !playerName}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Iniciar Jogo
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setCurrentStep('menu')}
                className="w-full"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            <a href="/" className="text-blue-400 hover:text-blue-300 underline mr-4">
              Voltar para versão completa
            </a>
            <a href="/test" className="text-blue-400 hover:text-blue-300 underline">
              Testar conexão
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}