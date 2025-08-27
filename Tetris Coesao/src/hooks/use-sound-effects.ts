'use client';

import { useEffect, useRef } from 'react';

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Inicializar o AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playCorrectSound = () => {
    // Som de sucesso - notas ascendentes
    playSound(523.25, 0.1); // C5
    setTimeout(() => playSound(659.25, 0.1), 100); // E5
    setTimeout(() => playSound(783.99, 0.2), 200); // G5
  };

  const playWrongSound = () => {
    // Som de erro - nota descendente
    playSound(330, 0.3, 'sawtooth'); // E4
  };

  const playGameOverSound = () => {
    // Som de game over - notas descendentes
    playSound(440, 0.2); // A4
    setTimeout(() => playSound(349.23, 0.2), 150); // F4
    setTimeout(() => playSound(261.63, 0.4), 300); // C4
  };

  const playTickSound = () => {
    // Som de tick do relógio
    playSound(800, 0.05, 'square');
  };

  return {
    playCorrectSound,
    playWrongSound,
    playGameOverSound,
    playTickSound
  };
};