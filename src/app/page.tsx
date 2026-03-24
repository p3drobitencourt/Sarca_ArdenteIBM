"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, BarChart3, ArrowRight, Activity, Building2, LogOut } from "lucide-react";
export default function HomePage() {
  const [stats, setStats] = useState({ members: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    Promise.all([
      fetch('/api/members').then(res => res.json()),
      fetch(`/api/attendance?date=${today}`).then(res => res.json())
    ]).then(([members, attendance]) => {
      setStats({
        members: Array.isArray(members) ? members.length : 0,
        today: Array.isArray(attendance) ? attendance.filter((a: any) => a.status === 'presente').length : 0
      });
      setLoading(false);
    });
  }, []);

  const menuItems = [
    {
      title: "Gerenciar Membros",
      description: "Cadastre novos membros ou remova registros.",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      link: "/members",
      color: "border-l-blue-500"
    },
    {
      title: "Fazer Chamada",
      description: "Registre presenças, faltas e justificativas.",
      icon: <UserCheck className="w-6 h-6 text-green-600" />,
      link: "/attendance/record",
      color: "border-l-green-500"
    },
    {
      title: "Relatórios",
      description: "Analise a frequência diária e individual.",
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      link: "/attendance/reports",
      color: "border-l-purple-500"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-8 max-w-6xl mx-auto space-y-8 flex-grow">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Sarça <span className="text-orange-600">Ardente</span>
            </h1>
            <p className="text-gray-500">Sistema de Gestão e Frequência</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4" /> Pimba Corp. Verified
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold flex gap-2"
            onClick={() => window.location.href = '/api/auth/logout'}
          >
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </Button>
        </header>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase">Total de Membros</p>
                  <h3 className="text-3xl font-bold text-blue-900">{loading ? "..." : stats.members}</h3>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-600 uppercase">Presentes Hoje</p>
                  <h3 className="text-3xl font-bold text-green-900">{loading ? "..." : stats.today}</h3>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <Card 
              key={idx} 
              className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${item.color}`}
              onClick={() => window.location.href = item.link}
            >
              <CardHeader>
                <div className="p-2 bg-gray-50 rounded-lg w-fit mb-2">{item.icon}</div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                <Button variant="ghost" className="p-0 hover:bg-transparent text-blue-600 font-bold group">
                  Acessar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* --- RODAPÉ DA PIMBA CORPORATION --- */}
      <footer className="w-full border-t py-6 bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-gray-700">Pimba Corporation</span>
            <span className="hidden md:inline">|</span>
            <span>Transformando dados em conexões.</span>
          </div>
          <div className="flex gap-4">
            <span className="italic">v1.0.4-stable</span>
            <span>&copy; {new Date().getFullYear()} Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}