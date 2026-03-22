"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Calendar, ChevronLeft, User, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [view, setView] = useState<'daily' | 'individual'>('daily');
  const [loading, setLoading] = useState(true);

  const clearHistory = async () => {
    if (!confirm("A Pimba Corp. avisa: isso apagará TODAS as presenças. Deseja continuar?")) return;
    
    try {
      const res = await fetch('/api/attendance', { method: 'DELETE' });
      if (res.ok) {
        alert("Histórico apagado!");
        window.location.reload(); // Recarrega para limpar a tela
      }
    } catch (err) {
      alert("Erro ao limpar histórico.");
    }
  };

  useEffect(() => {
    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setRecords(data);
        setLoading(false);
      });
  }, []);

  // Mapeamento de Cores
  const statusColors: any = {
    presente: "text-green-600 bg-green-50 border-green-200",
    falta: "text-red-600 bg-red-50 border-red-200",
    justificada: "text-yellow-600 bg-yellow-50 border-yellow-200"
  };

  // NOVO: Mapeamento de Nomes Amigáveis
  const statusLabels: any = {
    presente: "Presente",
    falta: "Falta",
    justificada: "Falta Justificada" // Aqui está a alteração!
  };

  // Lógica de agrupamento diário
  const groupedByDate = records.reduce((acc: any, curr: any) => {
    const date = curr.date || "Sem data";
    if (!acc[date]) acc[date] = { items: [], stats: { presente: 0, falta: 0, justificada: 0 } };
    acc[date].items.push(curr);
    if (curr.status) acc[date].stats[curr.status]++;
    return acc;
  }, {});

  // Lógica de agrupamento individual
  const groupedByMember = records.reduce((acc: any, curr: any) => {
    const name = curr.memberName || "Desconhecido";
    if (!acc[name]) acc[name] = { p: 0, f: 0, fj: 0, total: 0 };
    if (curr.status === 'presente') acc[name].p++;
    else if (curr.status === 'falta') acc[name].f++;
    else if (curr.status === 'justificada') acc[name].fj++;
    acc[name].total++;
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-600" /> Relatórios
        </h1>
        <Button variant="destructive" onClick={clearHistory}>
          Limpar Histórico
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>

      {/* Seletor de Abas */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        <Button 
          variant={view === 'daily' ? 'secondary' : 'ghost'} 
          className={view === 'daily' ? 'bg-white shadow-sm' : ''}
          onClick={() => setView('daily')}
        >
          <Calendar className="w-4 h-4 mr-2" /> Visão por Dia
        </Button>
        <Button 
          variant={view === 'individual' ? 'secondary' : 'ghost'} 
          className={view === 'individual' ? 'bg-white shadow-sm' : ''}
          onClick={() => setView('individual')}
        >
          <User className="w-4 h-4 mr-2" /> Visão por Membro
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-gray-500 italic">Consultando o Cloudant...</div>
      ) : view === 'daily' ? (
        Object.keys(groupedByDate).sort().reverse().map((date) => (
          <Card key={date} className="overflow-hidden border-t-4 border-t-blue-500">
            <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">
                {new Date(date + "T00:00:00").toLocaleDateString('pt-BR')}
              </CardTitle>
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider">
                <span className="text-green-600">P: {groupedByDate[date].stats.presente}</span>
                <span className="text-red-600">F: {groupedByDate[date].stats.falta}</span>
                <span className="text-yellow-600">FJ: {groupedByDate[date].stats.justificada}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {groupedByDate[date].items.map((record: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-gray-700">{record.memberName}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${statusColors[record.status]}`}>
                          {statusLabels[record.status]} {/* USANDO O LABEL AMIGÁVEL AQUI */}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      ) : (
        /* --- VISÃO POR MEMBRO --- */
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="w-5 h-5" /> Frequência de Membros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold">Membro</TableHead>
                  <TableHead className="text-center font-bold">Presente</TableHead>
                  <TableHead className="text-center font-bold">Faltas</TableHead>
                  <TableHead className="text-center font-bold">Justificadas</TableHead>
                  <TableHead className="text-right font-bold">Taxa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(groupedByMember).sort().map((name) => {
                  const stats = groupedByMember[name];
                  const freq = ((stats.p / stats.total) * 100).toFixed(0);
                  return (
                    <TableRow key={name}>
                      <TableCell className="font-bold">{name}</TableCell>
                      <TableCell className="text-center text-green-600 font-bold">{stats.p}</TableCell>
                      <TableCell className="text-center text-red-600 font-bold">{stats.f}</TableCell>
                      <TableCell className="text-center text-yellow-600 font-bold">{stats.fj}</TableCell>
                      <TableCell className="text-right font-black text-blue-600">{freq}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}