"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, X, AlertCircle, Calendar as CalendarIcon, ChevronLeft, UserCheck } from "lucide-react";


export default function AttendanceRecordPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<any>({}); // Mapeia memberId -> status
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Carrega membros e as presenças da data selecionada
  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        fetch('/api/members'),
        fetch(`/api/attendance?date=${selectedDate}`)
      ]);
      
      const mData = await mRes.json();
      const aData = await aRes.json();

      if (!mData.error) setMembers(mData);
      
      // Cria um mapa de presenças para busca rápida: { "id_do_joao": "presente" }
      const map: any = {};
      aData.forEach((rec: any) => { map[rec.memberId] = rec.status; });
      setAttendanceMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedDate]);

  const handleMark = async (member: any, status: string) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memberId: member._id, 
          memberName: member.name, 
          date: selectedDate, 
          status 
        })
      });

      if (res.ok) {
        setAttendanceMap((prev: any) => ({ ...prev, [member._id]: status }));
      }
    } catch (err) {
      alert("Erro ao salvar.");
    }
  };

 return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* CABEÇALHO COM BOTÃO VOLTAR E TÍTULO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold">Chamada</h1>
        </div>

        {/* SELETOR DE DATA */}
        <div className="flex items-center gap-2 bg-white p-2 border rounded-lg shadow-sm">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <Input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* LEGENDA */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border rounded-lg shadow-sm text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600"></span>
          <span className="font-bold text-green-700">P:</span> <span>Presente</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          <span className="font-bold text-red-700">F:</span> <span>Falta</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
          <span className="font-bold text-yellow-700">FJ:</span> <span>Falta Justificada</span>
        </div>
      </div>

      {/* LISTA DE MEMBROS */}
      <Card>
        <CardHeader><CardTitle>Membros</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-center p-4">Sincronizando com Cloudant...</p> : (
            <div className="divide-y border rounded-lg overflow-hidden bg-white">
              {members.map((m) => {
                const currentStatus = attendanceMap[m._id];
                return (
                  <div key={m._id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="font-medium text-lg">{m.name}</span>
                    <div className="flex gap-2">
                      <StatusButton 
                        active={currentStatus === 'presente'} 
                        variant="presente"
                        onClick={() => handleMark(m, 'presente')} 
                      />
                      <StatusButton 
                        active={currentStatus === 'falta'} 
                        variant="falta"
                        onClick={() => handleMark(m, 'falta')} 
                      />
                      <StatusButton 
                        active={currentStatus === 'justificada'} 
                        variant="justificada"
                        onClick={() => handleMark(m, 'justificada')} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente auxiliar para os botões de status
function StatusButton({ active, variant, onClick }: any) {
  const styles: any = {
    presente: active ? "bg-green-600 text-white" : "text-green-600 border-green-600 hover:bg-green-50",
    falta: active ? "bg-red-600 text-white" : "text-red-600 border-red-600 hover:bg-red-50",
    justificada: active ? "bg-yellow-600 text-white" : "text-yellow-600 border-yellow-600 hover:bg-yellow-50",
  };
  
  const labels: any = { presente: "P", falta: "F", justificada: "FJ" };

  return (
    <Button 
      variant="outline" 
      size="sm"
      className={`w-12 h-10 font-bold ${styles[variant]}`}
      onClick={onClick}
      disabled={active}
    >
      {labels[variant]}
    </Button>
  );
}