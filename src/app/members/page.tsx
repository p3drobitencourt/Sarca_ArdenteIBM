"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Users } from "lucide-react"; // Se não tiver, pode apagar essa linha

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Carrega a lista de membros
  const loadMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (!data.error) setMembers(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  // Salva um novo membro
  const handleAddMember = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, role: 'Membro' })
      });
      
      const result = await res.json();
      
      if (result.error) {
        alert("Erro ao cadastrar: " + result.error);
      } else {
        setNewName("");
        loadMembers(); // Atualiza a lista na hora
      }
    } catch (err) {
      alert("Erro na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, rev: string) => {
  if (!confirm("Tem certeza que deseja remover este membro?")) return;
  
  try {
    const res = await fetch(`/api/members?id=${id}&rev=${rev}`, {
      method: 'DELETE',
    });
    
    const result = await res.json();
    if (result.error) {
      alert("Erro ao deletar: " + result.error);
    } else {
      loadMembers(); // Recarrega a lista sem o membro deletado
    }
  } catch (err) {
    alert("Erro na conexão.");
  }
};

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" /> Gestão de Membros
        </h1>
        <Button variant="outline" onClick={() => window.location.href = '/'}>Voltar</Button>
      </div>

      {/* Card de Cadastro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Novo Membro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Digite o nome completo..." 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            />
            <Button onClick={handleAddMember} disabled={loading || !newName}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Membros */}
      <Card>
        <CardHeader>
          <CardTitle>Membros Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="divide-y border rounded-lg overflow-hidden bg-white">
              {members.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhum membro cadastrado na Sarça Ardente ainda.
                </div>
              ) : (
                members.map((m, i) => (
                    <div key={m._id || i} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div>
                        <span className="font-medium text-gray-800">{m.name}</span>
                        <p className="text-xs text-gray-500">{m.role || 'Membro'}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(m._id, m._rev)} // Chama a função que você já criou
                      >
                        Remover
                      </Button>
                    </div>
                  ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}