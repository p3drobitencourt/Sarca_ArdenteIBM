"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-orange-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-black">Pimba Corp. Auth</CardTitle>
          <p className="text-gray-500 text-sm italic">Bem-vindo ao sistema Sarça Ardente</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Para acessar os relatórios e chamadas, identifique-se abaixo.
          </p>
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-bold flex gap-2"
            onClick={() => window.location.href = '/api/auth/login'}
          >
            <LogIn className="w-5 h-5" /> Entrar com IBM ID
          </Button>
        </CardContent>
        <footer className="p-4 text-center text-[10px] text-gray-400 uppercase tracking-widest border-t">
          Security by Pimba Corporation &copy; 2026
        </footer>
      </Card>
    </div>
  );
}