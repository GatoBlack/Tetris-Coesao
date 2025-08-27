'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<'host' | 'player' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Conectivos em Queda
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Aprenda conectivos gramaticais com um jogo divertido no estilo Tetris!
          </p>
          <div className="text-center">
            <Link href="/test" className="text-sm text-blue-400 hover:text-blue-300 underline mr-4">
              Problemas de conexão? Teste aqui
            </Link>
            <Link href="/demo" className="text-sm text-green-400 hover:text-green-300 underline">
              Versão offline (demo)
            </Link>
          </div>
        </div>

        {!selectedRole ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                  onClick={() => setSelectedRole('host')}>
              <CardHeader className="text-center">
                <Monitor className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                <CardTitle className="text-2xl text-white">Professor</CardTitle>
                <CardDescription className="text-blue-200">
                  Crie salas, gerencie rodadas e acompanhe o progresso dos alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Acessar Painel
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                  onClick={() => setSelectedRole('player')}>
              <CardHeader className="text-center">
                <Smartphone className="w-16 h-16 mx-auto text-green-400 mb-4" />
                <CardTitle className="text-2xl text-white">Aluno</CardTitle>
                <CardDescription className="text-blue-200">
                  Entre em uma sala e jogue para aprender conectivos gramaticais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Entrar no Jogo
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
              <CardTitle className="text-2xl text-white">
                {selectedRole === 'host' ? 'Painel do Professor' : 'Jogo do Aluno'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRole === 'host' ? (
                <div className="space-y-4">
                  <p className="text-blue-200 text-center">
                    Como professor, você poderá criar salas, gerenciar o jogo e ver o progresso dos alunos em tempo real.
                  </p>
                  <Link href="/host">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Acessar Painel do Professor
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-blue-200 text-center">
                    Como aluno, você entrará em uma sala usando um código e participará do jogo de conectivos.
                  </p>
                  <Link href="/player">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Entrar no Jogo
                    </Button>
                  </Link>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => setSelectedRole(null)}
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}