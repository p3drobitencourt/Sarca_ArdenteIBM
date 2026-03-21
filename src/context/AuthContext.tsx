"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Loader } from '@/components/ui/loader';

// Define o tipo de dados que o contexto irá fornecer
interface AuthContextType {
  user: any | null;
  email?: string;
  loading: boolean;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType>({ user: null });

// Cria o componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há sessão do App ID salva em localStorage
    const session = localStorage.getItem('appid_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUser(parsed.user);
      } catch (e) {
        console.error('Erro ao parsear sessão:', e);
        localStorage.removeItem('appid_session');
      }
    }
    setLoading(false);
  }, []);

  // Enquanto verifica o usuário, mostra uma tela de carregamento global
  if (loading) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Cria um hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
