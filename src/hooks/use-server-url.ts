'use client';

import { useState, useEffect } from 'react';

export const useServerUrl = () => {
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    // Detectar se estamos em desenvolvimento ou produção
    if (typeof window !== 'undefined') {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // Em desenvolvimento, usar localhost
        setServerUrl('http://localhost:3000');
      } else {
        // Em produção, usar o mesmo domínio da página
        setServerUrl(window.location.origin);
      }
    }
  }, []);

  return serverUrl;
};