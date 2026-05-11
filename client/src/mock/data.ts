export type DocStatus = "processando" | "indexado" | "erro";

export interface Document {
  id: number;
  title: string;
  correspondent: string;
  tags: string[];
  created: string;
  added: string;
  pages: number;
  status: DocStatus;
  type: string;
  size: string;
}

export interface HistoryEntry {
  id: number;
  action: string;
  document: string;
  user: string;
  date: string;
  detail: string;
}

export interface UserGroup {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  group: string;
  active: boolean;
  lastAccess: string;
}

export const mockDocuments: Document[] = [
  { id: 1, title: "Contrato de Manutenção - Subestação SE-01", correspondent: "Energisa", tags: ["Contrato", "Manutenção", "2024"], created: "2024-03-15", added: "2024-03-16", pages: 12, status: "indexado", type: "PDF", size: "2.4 MB" },
  { id: 2, title: "Relatório de Inspeção Transformador TR-07", correspondent: "TSEA Engenharia", tags: ["Inspeção", "Transformador"], created: "2024-04-02", added: "2024-04-03", pages: 8, status: "indexado", type: "PDF", size: "1.8 MB" },
  { id: 3, title: "ART - Ampliação Rede BT Setor Industrial", correspondent: "CREA-SP", tags: ["ART", "Rede BT", "Industrial"], created: "2024-04-10", added: "2024-04-10", pages: 3, status: "indexado", type: "PDF", size: "0.9 MB" },
  { id: 4, title: "Memorial Descritivo - Projeto Fotovoltaico 150kW", correspondent: "TSEA Engenharia", tags: ["Solar", "Fotovoltaico", "Projeto"], created: "2024-04-18", added: "2024-04-19", pages: 24, status: "processando", type: "PDF", size: "5.1 MB" },
  { id: 5, title: "NR-10 - Certificado Treinamento Equipe Campo", correspondent: "RH TSEA", tags: ["NR-10", "Treinamento", "Segurança"], created: "2024-04-20", added: "2024-04-20", pages: 5, status: "indexado", type: "PDF", size: "1.2 MB" },
  { id: 6, title: "Nota Fiscal Equipamentos SE-03 - ABB", correspondent: "ABB Ltda.", tags: ["NF", "Compras", "Equipamento"], created: "2024-04-22", added: "2024-04-22", pages: 2, status: "indexado", type: "PDF", size: "0.5 MB" },
  { id: 7, title: "Planta Unifilar Subestação SE-05 Rev.3", correspondent: "TSEA Engenharia", tags: ["Planta", "Unifilar", "SE-05"], created: "2024-04-25", added: "2024-04-25", pages: 6, status: "indexado", type: "DWG", size: "8.7 MB" },
  { id: 8, title: "Laudo Técnico - Cabo XLPE 15kV Lote 22", correspondent: "Laboratório Eletro", tags: ["Laudo", "Cabo", "XLPE"], created: "2024-04-28", added: "2024-04-28", pages: 15, status: "erro", type: "PDF", size: "3.3 MB" },
  { id: 9, title: "Ordem de Serviço 2024-087 - Manutenção Preventiva", correspondent: "TSEA Operações", tags: ["OS", "Manutenção", "Preventiva"], created: "2024-05-01", added: "2024-05-01", pages: 4, status: "indexado", type: "PDF", size: "1.0 MB" },
  { id: 10, title: "Proposta Comercial - Ampliação SE Cerâmica Norte", correspondent: "Cerâmica Norte SA", tags: ["Proposta", "Comercial", "2024"], created: "2024-05-05", added: "2024-05-05", pages: 18, status: "indexado", type: "PDF", size: "4.2 MB" },
  { id: 11, title: "PMOC - Plano de Manutenção Ar Condicionado", correspondent: "TSEA Facilities", tags: ["PMOC", "Ar Condicionado"], created: "2024-05-07", added: "2024-05-07", pages: 9, status: "indexado", type: "PDF", size: "2.0 MB" },
  { id: 12, title: "Certificado Calibração Alicate Amperímetro", correspondent: "Inmetro Cert.", tags: ["Calibração", "Instrumento"], created: "2024-05-10", added: "2024-05-10", pages: 2, status: "processando", type: "PDF", size: "0.7 MB" },
];

export const mockHistory: HistoryEntry[] = [
  { id: 1, action: "Upload", document: "Contrato de Manutenção - Subestação SE-01", user: "admin@tsea.com.br", date: "2024-05-10 14:32", detail: "Documento enviado via upload manual" },
  { id: 2, action: "Edição", document: "Relatório de Inspeção Transformador TR-07", user: "engenharia@tsea.com.br", date: "2024-05-10 13:15", detail: "Tags atualizadas" },
  { id: 3, action: "Download", document: "ART - Ampliação Rede BT Setor Industrial", user: "admin@tsea.com.br", date: "2024-05-09 16:45", detail: "Download do arquivo original" },
  { id: 4, action: "Visualização", document: "NR-10 - Certificado Treinamento Equipe Campo", user: "rh@tsea.com.br", date: "2024-05-09 10:22", detail: "Visualizado no navegador" },
  { id: 5, action: "Exclusão", document: "Rascunho Projeto SE-04 v1", user: "admin@tsea.com.br", date: "2024-05-08 09:00", detail: "Documento excluído permanentemente" },
  { id: 6, action: "Upload", document: "Laudo Técnico - Cabo XLPE 15kV Lote 22", user: "lab@tsea.com.br", date: "2024-05-07 17:30", detail: "Falha no processamento OCR" },
  { id: 7, action: "Edição", document: "Planta Unifilar Subestação SE-05 Rev.3", user: "engenharia@tsea.com.br", date: "2024-05-06 11:00", detail: "Correspondente alterado" },
  { id: 8, action: "Download", document: "Nota Fiscal Equipamentos SE-03 - ABB", user: "financeiro@tsea.com.br", date: "2024-05-05 15:10", detail: "Download do arquivo original" },
];

export const mockUsers: UserGroup[] = [
  { id: 1, name: "Administrador TSEA", email: "admin@tsea.com.br", role: "admin", group: "Administradores", active: true, lastAccess: "Hoje, 14:32" },
  { id: 2, name: "Eng. Carlos Silva", email: "engenharia@tsea.com.br", role: "editor", group: "Engenharia", active: true, lastAccess: "Hoje, 13:15" },
  { id: 3, name: "RH Paula Costa", email: "rh@tsea.com.br", role: "viewer", group: "Recursos Humanos", active: true, lastAccess: "Ontem, 10:22" },
  { id: 4, name: "Financeiro João Lima", email: "financeiro@tsea.com.br", role: "viewer", group: "Financeiro", active: true, lastAccess: "Há 2 dias" },
  { id: 5, name: "Laboratório Técnico", email: "lab@tsea.com.br", role: "editor", group: "Engenharia", active: false, lastAccess: "Há 5 dias" },
  { id: 6, name: "Operações Campo", email: "operacoes@tsea.com.br", role: "viewer", group: "Operações", active: true, lastAccess: "Hoje, 08:00" },
];

export const mockTags = ["Contrato", "Manutenção", "2024", "Inspeção", "Transformador", "ART", "Rede BT", "Solar", "Fotovoltaico", "NR-10", "Treinamento", "Segurança", "NF", "Compras", "Planta", "Laudo", "OS", "Proposta", "Calibração"];

export const mockCorrespondents = ["TSEA Engenharia", "TSEA Operações", "RH TSEA", "Energisa", "CREA-SP", "ABB Ltda.", "Cerâmica Norte SA", "Laboratório Eletro", "Inmetro Cert."];

export const dashboardStats = {
  totalDocuments: 312,
  thisMonth: 24,
  processing: 3,
  errors: 1,
  storageUsed: "4.7 GB",
  storageTotal: "20 GB",
};
