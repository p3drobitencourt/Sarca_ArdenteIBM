"use client";

import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // IBM App ID OAuth 2.0 login (Authorization Code Grant flow)
  const handleOAuthLogin = async () => {
    try {
      setIsLoading(true);
      // Redireciona para rota de login que inicia o fluxo OAuth com App ID
      window.location.href = '/api/auth/login';
    } catch (error) {
      console.error("Erro ao iniciar autenticação:", error);
      toast({
        title: "Erro de Autenticação",
        description: "Não foi possível iniciar o processo de autenticação. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Icons.logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Sarça Ardente</CardTitle>
          <CardDescription>
            Sistema de Gestão de Membros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Você será redirecionado para fazer login com segurança.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleOAuthLogin} 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Autenticando..." : "Fazer Login com IBM App ID"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
