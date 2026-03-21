
// Interface para a coleção 'membros' (Cloudant)
export interface Member {
  _id?: string; // O ID do documento do Cloudant
  id?: string;
  nomeCompleto: string;
  telefone?: string;
  dataNascimento: string | number; // ISO 8601 string ou Unix timestamp
  dataDeIngresso: string | number;
  ativo: boolean;
  professo: boolean;
  criadoEm?: number; // Unix timestamp em ms
  atualizadoEm?: number; // Unix timestamp em ms
}

// Interface para a coleção 'classes' (Cloudant)
export interface Classe {
  _id?: string;
  id?: string;
  nome: string;
  descricao?: string;
  criadoEm?: number;
}

// Interface para a coleção 'reunioes' (Cloudant)
export interface Reuniao {
  _id?: string;
  id?: string;
  nome: string;
  descricao?: string;
  criadoEm?: number;
}

// Interface para a coleção 'presencas' (Cloudant)
export interface Presenca {
  _id?: string;
  id?: string;
  dataRegistro: number; // Unix timestamp em ms
  membroId: string;
  membroNome: string; // Denormalizado
  classeId: string;
  classeNome: string; // Denormalizado
  reuniaoId: string;
  reuniaoNome: string; // Denormalizado
  registradoPorId: string; // UserID do App ID
  arquivado?: boolean;
}
