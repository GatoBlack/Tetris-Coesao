import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configurações para deploy em produção
  output: 'standalone',
  experimental: {
    // Otimizações para build
    optimizePackageImports: ['lucide-react']
  },
  // Configurações de imagens
  images: {
    domains: ['localhost'],
    unoptimized: true
  }
};

export default nextConfig;
