"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserCheck } from "lucide-react";

export default function AttendanceRecordPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [marked, setMarked] = useState<string[]>([]); // Guarda os IDs de quem já ganhou presença hoje
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os membros da API que você já criou
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setMembers(data);
        setLoading(false);
      });
  }, []);

  const handleMarkAttendance = async (memberId: string, memberName: string) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, memberName })
      });

      if (res.ok) {
        setMarked(prev => [...prev, memberId]); // Marca visualmente na tela
      }
    } catch (err) {
      alert("Erro ao registrar presença.");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <UserCheck className="text-green-600" /> Registro de Presença
      </h1>
      <p className="text-muted-foreground">Chamada para o dia {new Date().toLocaleDateString('pt-BR')}</p>

      <Card>
        <CardHeader><CardTitle>Lista de Membros</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p>Carregando...</p> : (
            <div className="divide-y border rounded-lg overflow-hidden bg-white">
              {members.map((m) => {
                const isMarked = marked.includes(m._id);
                return (
                  <div key={m._id} className="p-4 flex justify-between items-center">
                    <span className="font-medium">{m.name}</span>
                    <Button 
                      onClick={() => handleMarkAttendance(m._id, m.name)}
                      disabled={isMarked}
                      variant={isMarked ? "outline" : "default"}
                      className={isMarked ? "text-green-600 border-green-600" : ""}
                    >
                      {isMarked ? (
                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Presente</span>
                      ) : "Confirmar Presença"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Button variant="ghost" onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
    </div>
  );
}