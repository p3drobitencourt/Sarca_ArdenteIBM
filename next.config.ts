import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mantemos o standalone para facilitar o deploy na Vercel/Docker
  output: 'standalone',

  // Removido o bloco eslint que causava o erro "Unrecognized key"
  
  typescript: {
    // Mantivemos para evitar que erros de tipagem barrem seu deploy de última hora
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;