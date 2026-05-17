// ── Tipos base ────────────────────────────────────────────────────────────────

export type DocStatus = "indexado" | "processando" | "erro";
export type Role = "administrador" | "supervisor" | "operador";
export type AuditAction =
  | "login" | "logout" | "falha_login"
  | "upload" | "download" | "visualizacao"
  | "alteracao" | "exclusao" | "publicacao_revisao"
  | "alteracao_permissao" | "criacao_usuario" | "troca_senha";

// ── Tipos de Documento ────────────────────────────────────────────────────────

export interface DocumentType {
  id: number;
  name: string;
  description: string;
  prefix: string;
}

export const mockDocumentTypes: DocumentType[] = [
  { id: 1, name: "Desenho Técnico",       description: "Plantas, esquemas e desenhos de engenharia", prefix: "DES" },
  { id: 2, name: "Procedimento",           description: "Procedimentos operacionais e de manutenção", prefix: "PRO" },
  { id: 3, name: "Instrução de Trabalho",  description: "Instruções passo a passo para operadores",  prefix: "ITP" },
  { id: 4, name: "Checklist",              description: "Listas de verificação e inspeção",           prefix: "CHK" },
  { id: 5, name: "Relatório / Laudo",      description: "Relatórios técnicos e laudos",              prefix: "LAU" },
  { id: 6, name: "ART / RRT",             description: "Anotação de Responsabilidade Técnica",       prefix: "ART" },
  { id: 7, name: "Certificado",            description: "Certificados de calibração, treinamento",   prefix: "CER" },
  { id: 8, name: "Contrato",               description: "Contratos e documentos legais",             prefix: "CON" },
];

// ── Tags ──────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export const mockTagObjects: Tag[] = [
  { id: 1,  name: "Manutenção",   color: "#3B82F6", description: "Documentos de manutenção" },
  { id: 2,  name: "Inspeção",     color: "#8B5CF6" },
  { id: 3,  name: "NR-10",        color: "#EF4444", description: "Norma Regulamentadora 10 - Segurança em Instalações Elétricas" },
  { id: 4,  name: "Transformador",color: "#F59E0B" },
  { id: 5,  name: "Alta Tensão",  color: "#EF4444", description: "Equipamentos e sistemas de alta tensão" },
  { id: 6,  name: "Subestação",   color: "#10B981" },
  { id: 7,  name: "Solar",        color: "#F59E0B", description: "Geração solar fotovoltaica" },
  { id: 8,  name: "Preventiva",   color: "#06B6D4" },
  { id: 9,  name: "Corretiva",    color: "#F97316" },
  { id: 10, name: "NF",           color: "#6B7280" },
  { id: 11, name: "Treinamento",  color: "#10B981", description: "Certificados e treinamentos de equipe" },
  { id: 12, name: "Segurança",    color: "#EF4444" },
  { id: 13, name: "Checklist",    color: "#3B82F6" },
  { id: 14, name: "Laudo",        color: "#8B5CF6" },
  { id: 15, name: "OS",           color: "#6B7280", description: "Ordens de Serviço" },
  { id: 16, name: "Calibração",   color: "#06B6D4" },
  { id: 17, name: "ART",          color: "#F97316" },
  { id: 18, name: "2024",         color: "#6B7280" },
  { id: 19, name: "2025",         color: "#374151" },
  { id: 20, name: "Projeto",      color: "#3B82F6" },
];

// keep legacy string array for backward compat
export const mockTags: string[] = mockTagObjects.map((t) => t.name);

// ── Versões de Documento ──────────────────────────────────────────────────────

export interface DocumentVersion {
  id: number;
  documentId: number;
  revision: string;
  uploadedBy: string;
  uploadedAt: string;
  isCurrent: boolean;
  changeDescription: string;
  checksum: string;
  size: string;
  filePath: string;
}

// ── Documentos ────────────────────────────────────────────────────────────────

export interface Document {
  id: number;
  code: string;
  title: string;
  description: string;
  typeId: number;
  correspondentId: number;
  storagePathId: number;
  tags: string[];
  created: string;
  added: string;
  pages: number;
  status: DocStatus;
  fileType: string;
  currentRevision: string;
  isFavorite: boolean;
  versions: DocumentVersion[];
}

export const mockDocuments: Document[] = [
  {
    id: 1, code: "DES-001", title: "Planta Unifilar Subestação SE-01", description: "Planta unifilar completa da subestação SE-01 com todos os disjuntores e chaves.",
    typeId: 1, correspondentId: 1, storagePathId: 1, tags: ["Alta Tensão", "Subestação", "2024"],
    created: "2024-01-15", added: "2024-01-16", pages: 6, status: "indexado", fileType: "PDF", currentRevision: "REV04", isFavorite: false,
    versions: [
      { id: 101, documentId: 1, revision: "REV04", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-04-10 09:00", isCurrent: true,  changeDescription: "Atualização do ramal de entrada conforme projeto aprovado.", checksum: "8f34f2ab-22cd", size: "8.7 MB", filePath: "/storage/2024/8f34f2ab.pdf" },
      { id: 102, documentId: 1, revision: "REV03", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2023-11-20 14:30", isCurrent: false, changeDescription: "Correção do esquema de aterramento.", checksum: "a12bc3d4-ef56", size: "8.2 MB", filePath: "/storage/2023/a12bc3d4.pdf" },
      { id: 103, documentId: 1, revision: "REV02", uploadedBy: "admin@tsea.com.br",       uploadedAt: "2023-06-05 10:00", isCurrent: false, changeDescription: "Revisão geral pós-vistoria CREA.", checksum: "b23cd4e5-fg67", size: "7.9 MB", filePath: "/storage/2023/b23cd4e5.pdf" },
      { id: 104, documentId: 1, revision: "REV01", uploadedBy: "admin@tsea.com.br",       uploadedAt: "2023-01-10 08:00", isCurrent: false, changeDescription: "Versão inicial do projeto.", checksum: "c34de5f6-gh78", size: "7.1 MB", filePath: "/storage/2023/c34de5f6.pdf" },
    ],
  },
  {
    id: 2, code: "PRO-001", title: "Procedimento de Manutenção Preventiva SE-01", description: "Procedimento completo para execução da manutenção preventiva semestral da subestação SE-01.",
    typeId: 2, correspondentId: 2, storagePathId: 1, tags: ["Manutenção", "Preventiva", "Subestação", "2024"],
    created: "2024-02-01", added: "2024-02-02", pages: 12, status: "indexado", fileType: "PDF", currentRevision: "REV02", isFavorite: false,
    versions: [
      { id: 201, documentId: 2, revision: "REV02", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-02-01 11:00", isCurrent: true,  changeDescription: "Inclusão de EPI obrigatório para cada etapa.", checksum: "d45ef6g7-hi89", size: "2.4 MB", filePath: "/storage/2024/d45ef6g7.pdf" },
      { id: 202, documentId: 2, revision: "REV01", uploadedBy: "admin@tsea.com.br",       uploadedAt: "2023-03-15 09:30", isCurrent: false, changeDescription: "Versão inicial.", checksum: "e56fg7h8-ij90", size: "2.1 MB", filePath: "/storage/2023/e56fg7h8.pdf" },
    ],
  },
  {
    id: 3, code: "ITP-001", title: "Instrução de Trabalho — Troca de Fusível NH", description: "Passo a passo para troca segura de fusíveis NH em painéis de baixa tensão.",
    typeId: 3, correspondentId: 3, storagePathId: 2, tags: ["NR-10", "Segurança", "2025"],
    created: "2025-01-10", added: "2025-01-10", pages: 4, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 301, documentId: 3, revision: "REV01", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2025-01-10 08:00", isCurrent: true, changeDescription: "Versão inicial aprovada pelo supervisor.", checksum: "f67gh8i9-jk01", size: "0.9 MB", filePath: "/storage/2025/f67gh8i9.pdf" },
    ],
  },
  {
    id: 4, code: "CHK-001", title: "Checklist Inspeção Diária — Painel CC", description: "Lista de verificação para inspeção diária dos painéis de corrente contínua.",
    typeId: 4, correspondentId: 4, storagePathId: 2, tags: ["Checklist", "Inspeção", "Preventiva"],
    created: "2024-03-05", added: "2024-03-05", pages: 2, status: "indexado", fileType: "PDF", currentRevision: "REV03", isFavorite: false,
    versions: [
      { id: 401, documentId: 4, revision: "REV03", uploadedBy: "operacoes@tsea.com.br", uploadedAt: "2024-12-01 07:30", isCurrent: true,  changeDescription: "Adição de itens de verificação de temperatura.", checksum: "g78hi9j0-kl12", size: "0.5 MB", filePath: "/storage/2024/g78hi9j0.pdf" },
      { id: 402, documentId: 4, revision: "REV02", uploadedBy: "operacoes@tsea.com.br", uploadedAt: "2024-07-10 08:00", isCurrent: false, changeDescription: "Revisão de layout para impressão A4.", checksum: "h89ij0k1-lm23", size: "0.4 MB", filePath: "/storage/2024/h89ij0k1.pdf" },
      { id: 403, documentId: 4, revision: "REV01", uploadedBy: "admin@tsea.com.br",       uploadedAt: "2024-03-05 09:00", isCurrent: false, changeDescription: "Versão inicial.", checksum: "i90jk1l2-mn34", size: "0.4 MB", filePath: "/storage/2024/i90jk1l2.pdf" },
    ],
  },
  {
    id: 5, code: "LAU-001", title: "Laudo Técnico — Cabo XLPE 15kV Lote 22", description: "Laudo de ensaio dielétrico do cabo XLPE 15kV do lote 22.",
    typeId: 5, correspondentId: 5, storagePathId: 3, tags: ["Laudo", "Alta Tensão"],
    created: "2024-04-28", added: "2024-04-28", pages: 15, status: "erro", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 501, documentId: 5, revision: "REV01", uploadedBy: "lab@tsea.com.br", uploadedAt: "2024-04-28 17:30", isCurrent: true, changeDescription: "Versão inicial — erro no processamento OCR.", checksum: "j01kl2m3-no45", size: "3.3 MB", filePath: "/storage/2024/j01kl2m3.pdf" },
    ],
  },
  {
    id: 6, code: "ART-001", title: "ART — Ampliação Rede BT Setor Industrial", description: "Anotação de Responsabilidade Técnica para obra de ampliação da rede de baixa tensão.",
    typeId: 6, correspondentId: 2, storagePathId: 4, tags: ["ART", "2024"],
    created: "2024-04-10", added: "2024-04-10", pages: 3, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 601, documentId: 6, revision: "REV01", uploadedBy: "admin@tsea.com.br", uploadedAt: "2024-04-10 14:00", isCurrent: true, changeDescription: "Versão inicial registrada no CREA-SP.", checksum: "k12lm3n4-op56", size: "0.9 MB", filePath: "/storage/2024/k12lm3n4.pdf" },
    ],
  },
  {
    id: 7, code: "CER-001", title: "NR-10 — Certificado Treinamento Equipe Campo", description: "Certificado de treinamento NR-10 Básico + SEP para os operadores de campo.",
    typeId: 7, correspondentId: 6, storagePathId: 5, tags: ["NR-10", "Treinamento", "Segurança"],
    created: "2024-04-20", added: "2024-04-20", pages: 5, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 701, documentId: 7, revision: "REV01", uploadedBy: "rh@tsea.com.br", uploadedAt: "2024-04-20 10:00", isCurrent: true, changeDescription: "Versão inicial.", checksum: "l23mn4o5-pq67", size: "1.2 MB", filePath: "/storage/2024/l23mn4o5.pdf" },
    ],
  },
  {
    id: 8, code: "PRO-002", title: "Memorial Descritivo — Projeto Fotovoltaico 150kW", description: "Memorial descritivo completo do projeto de geração solar de 150kW.",
    typeId: 2, correspondentId: 2, storagePathId: 6, tags: ["Solar", "Projeto", "2024"],
    created: "2024-04-18", added: "2024-04-19", pages: 24, status: "processando", fileType: "PDF", currentRevision: "REV02", isFavorite: false,
    versions: [
      { id: 801, documentId: 8, revision: "REV02", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-04-18 16:00", isCurrent: true,  changeDescription: "Atualização com especificação dos inversores Fronius.", checksum: "m34no5p6-qr78", size: "5.1 MB", filePath: "/storage/2024/m34no5p6.pdf" },
      { id: 802, documentId: 8, revision: "REV01", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-02-10 09:00", isCurrent: false, changeDescription: "Versão inicial do memorial.", checksum: "n45op6q7-rs89", size: "4.8 MB", filePath: "/storage/2024/n45op6q7.pdf" },
    ],
  },
  {
    id: 9, code: "PRO-003", title: "Ordem de Serviço 2024-087 — Manutenção Preventiva TR-07", description: "Ordem de serviço para manutenção preventiva semestral do transformador TR-07.",
    typeId: 2, correspondentId: 4, storagePathId: 2, tags: ["OS", "Manutenção", "Preventiva", "Transformador"],
    created: "2024-05-01", added: "2024-05-01", pages: 4, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 901, documentId: 9, revision: "REV01", uploadedBy: "operacoes@tsea.com.br", uploadedAt: "2024-05-01 07:00", isCurrent: true, changeDescription: "Versão inicial da OS.", checksum: "o56pq7r8-st90", size: "1.0 MB", filePath: "/storage/2024/o56pq7r8.pdf" },
    ],
  },
  {
    id: 10, code: "CON-001", title: "Nota Fiscal — Equipamentos SE-03 ABB", description: "Nota fiscal referente à compra de disjuntores e IHMs para a subestação SE-03.",
    typeId: 8, correspondentId: 1, storagePathId: 7, tags: ["NF", "2024"],
    created: "2024-04-22", added: "2024-04-22", pages: 2, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 1001, documentId: 10, revision: "REV01", uploadedBy: "financeiro@tsea.com.br", uploadedAt: "2024-04-22 15:00", isCurrent: true, changeDescription: "Versão inicial.", checksum: "p67qr8s9-tu01", size: "0.5 MB", filePath: "/storage/2024/p67qr8s9.pdf" },
    ],
  },
  {
    id: 11, code: "CER-002", title: "Certificado Calibração Alicate Amperímetro SN-4421", description: "Certificado de calibração do alicate amperímetro nº série 4421.",
    typeId: 7, correspondentId: 5, storagePathId: 3, tags: ["Calibração"],
    created: "2024-05-10", added: "2024-05-10", pages: 2, status: "processando", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 1101, documentId: 11, revision: "REV01", uploadedBy: "lab@tsea.com.br", uploadedAt: "2024-05-10 11:00", isCurrent: true, changeDescription: "Versão inicial.", checksum: "q78rs9t0-uv12", size: "0.7 MB", filePath: "/storage/2024/q78rs9t0.pdf" },
    ],
  },
  {
    id: 12, code: "PRO-004", title: "PMOC — Plano de Manutenção Ar Condicionado", description: "Plano de manutenção e operação e controle dos equipamentos de ar condicionado.",
    typeId: 2, correspondentId: 3, storagePathId: 8, tags: ["Manutenção", "Preventiva"],
    created: "2024-05-07", added: "2024-05-07", pages: 9, status: "indexado", fileType: "PDF", currentRevision: "REV02", isFavorite: false,
    versions: [
      { id: 1201, documentId: 12, revision: "REV02", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-05-07 14:00", isCurrent: true,  changeDescription: "Atualização do cronograma de manutenção.", checksum: "r89st0u1-vw23", size: "2.0 MB", filePath: "/storage/2024/r89st0u1.pdf" },
      { id: 1202, documentId: 12, revision: "REV01", uploadedBy: "admin@tsea.com.br",       uploadedAt: "2023-09-01 10:00", isCurrent: false, changeDescription: "Versão inicial.", checksum: "s90tu1v2-wx34", size: "1.8 MB", filePath: "/storage/2023/s90tu1v2.pdf" },
    ],
  },
];

// ── Logs de Atividade Industrial ──────────────────────────────────────────────

export interface Correspondent {
  id: number;
  name: string;
  description: string;
}

export const mockCorrespondents: Correspondent[] = [
  { id: 1, name: "ABB Ltda.", description: "Fornecedor de equipamentos de subestacao e automacao." },
  { id: 2, name: "TSEA Engenharia", description: "Equipe interna responsavel pelos documentos tecnicos." },
  { id: 3, name: "Supervisor de Campo", description: "Responsavel operacional pela execucao em campo." },
  { id: 4, name: "Operacoes TSEA", description: "Area de manutencao e operacao industrial." },
  { id: 5, name: "Laboratorio Tecnico", description: "Equipe de ensaios, laudos e calibracao." },
  { id: 6, name: "Recursos Humanos", description: "Responsavel por treinamentos e certificados." },
];

export interface StoragePath {
  id: number;
  path: string;
  description: string;
}

export const mockStoragePaths: StoragePath[] = [
  { id: 1, path: "documents/SE-01/desenhos", description: "Desenhos e procedimentos da subestacao SE-01." },
  { id: 2, path: "documents/operacoes/checklists", description: "Checklists e ordens operacionais do chao de fabrica." },
  { id: 3, path: "documents/laboratorio/laudos", description: "Laudos, ensaios e certificados de calibracao." },
  { id: 4, path: "documents/legal/art", description: "Documentos legais e ARTs do sistema." },
  { id: 5, path: "documents/rh/treinamentos", description: "Certificados e historicos de treinamento." },
  { id: 6, path: "documents/projetos/fotovoltaico", description: "Memoriais e documentos do projeto fotovoltaico." },
  { id: 7, path: "documents/financeiro/notas-fiscais", description: "Notas fiscais e comprovantes de compra." },
  { id: 8, path: "documents/utilidades/pmoc", description: "Planos de manutencao predial e utilidades." },
];

export interface ActivityLog {
  id: number;
  userName: string;
  tagCode: string;
  documentCode: string;
  documentRevision: string;
  documentTitle: string;
  action: "Visualizou" | "Baixou" | "Publicou" | "Registrou conclusão";
  time: string;
}

export const mockActivityLogs: ActivityLog[] = [
  { id: 1, userName: "Carlos Silva",      tagCode: "TSEA-2041", documentCode: "ITP-001", documentRevision: "REV01", documentTitle: "Instrução de Trabalho — Troca de Fusível NH",         action: "Visualizou",          time: "10:42" },
  { id: 2, userName: "Ana Pereira",       tagCode: "TSEA-1088", documentCode: "CHK-001", documentRevision: "REV03", documentTitle: "Checklist Inspeção Diária — Painel CC",               action: "Registrou conclusão", time: "09:15" },
  { id: 3, userName: "João Lima",         tagCode: "TSEA-3302", documentCode: "PRO-001", documentRevision: "REV02", documentTitle: "Procedimento de Manutenção Preventiva SE-01",          action: "Baixou",              time: "08:30" },
  { id: 4, userName: "Pedro Santos",      tagCode: "TSEA-0505", documentCode: "DES-001", documentRevision: "REV04", documentTitle: "Planta Unifilar Subestação SE-01",                     action: "Visualizou",          time: "Ontem 16:20" },
  { id: 5, userName: "Marta Oliveira",    tagCode: "TSEA-1777", documentCode: "CER-001", documentRevision: "REV01", documentTitle: "NR-10 — Certificado Treinamento Equipe Campo",         action: "Baixou",              time: "Ontem 11:05" },
  { id: 6, userName: "Eng. Rafael Costa", tagCode: "TSEA-0099", documentCode: "PRO-002", documentRevision: "REV02", documentTitle: "Memorial Descritivo — Projeto Fotovoltaico 150kW",    action: "Publicou",            time: "14/05 09:00" },
];

// ── Conclusões de Lote (legado) ───────────────────────────────────────────────

export interface BatchCompletion {
  id: number;
  documentId: number;
  documentCode: string;
  documentTitle: string;
  operatorName: string;
  operatorEmail: string;
  completedAt: string;
  batchCode: string;
  notes: string;
}

export const mockBatchCompletions: BatchCompletion[] = [
  { id: 1, documentId: 3, documentCode: "ITP-001", documentTitle: "Instrução de Trabalho — Troca de Fusível NH", operatorName: "Carlos Silva", operatorEmail: "operacoes@tsea.com.br", completedAt: "2025-01-11 07:45", batchCode: "LOTE-2025-001", notes: "Concluído sem intercorrências. EPI utilizado conforme instrução." },
  { id: 2, documentId: 4, documentCode: "CHK-001", documentTitle: "Checklist Inspeção Diária — Painel CC",       operatorName: "Ana Pereira",  operatorEmail: "operacoes@tsea.com.br", completedAt: "2025-01-11 08:30", batchCode: "INSP-2025-011", notes: "Todos os itens verificados. Temperatura normal." },
  { id: 3, documentId: 9, documentCode: "PRO-003", documentTitle: "Ordem de Serviço 2024-087",                   operatorName: "João Lima",    operatorEmail: "engenharia@tsea.com.br", completedAt: "2024-05-03 17:00", batchCode: "OS-2024-087",   notes: "Manutenção executada. Próxima revisão: novembro/2024." },
];

// ── Auditoria ─────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userDisplayName: string;
  tagCode: string;
  userRole: Role;
  action: AuditAction;
  entity: string;
  entityCode: string;
  date: string;
  ip: string;
  terminal: string;
  detail: string;
}

export const mockAuditLogs: AuditLog[] = [
  { id: 1,  userId: 1, userName: "admin@tsea.com.br",       userDisplayName: "Administrador TSEA", tagCode: "TSEA-0001", userRole: "administrador", action: "login",               entity: "Sistema",   entityCode: "-",       date: "2025-01-11 14:32", ip: "192.168.1.10",  terminal: "DESKTOP-ADM01",    detail: "Login realizado com sucesso." },
  { id: 2,  userId: 1, userName: "admin@tsea.com.br",       userDisplayName: "Administrador TSEA", tagCode: "TSEA-0001", userRole: "administrador", action: "upload",              entity: "Documento", entityCode: "ITP-001", date: "2025-01-11 14:35", ip: "192.168.1.10",  terminal: "DESKTOP-ADM01",    detail: "Upload da revisão REV01 do documento ITP-001." },
  { id: 3,  userId: 2, userName: "engenharia@tsea.com.br",  userDisplayName: "Eng. Carlos Silva",  tagCode: "TSEA-2041", userRole: "supervisor",    action: "visualizacao",        entity: "Documento", entityCode: "DES-001", date: "2025-01-11 13:15", ip: "192.168.1.22",  terminal: "NOTEBOOK-ENG01",   detail: "Visualização da revisão vigente REV04." },
  { id: 4,  userId: 3, userName: "rh@tsea.com.br",          userDisplayName: "RH Paula Costa",     tagCode: "TSEA-1088", userRole: "operador",      action: "download",            entity: "Documento", entityCode: "CER-001", date: "2025-01-10 10:22", ip: "192.168.1.31",  terminal: "PC-RH01",          detail: "Download do arquivo original REV01." },
  { id: 5,  userId: 1, userName: "admin@tsea.com.br",       userDisplayName: "Administrador TSEA", tagCode: "TSEA-0001", userRole: "administrador", action: "publicacao_revisao",  entity: "Documento", entityCode: "CHK-001", date: "2024-12-01 07:35", ip: "192.168.1.10",  terminal: "DESKTOP-ADM01",    detail: "Publicação da REV03 como versão vigente." },
  { id: 6,  userId: 4, userName: "lab@tsea.com.br",         userDisplayName: "Laboratório Técnico",tagCode: "TSEA-4421", userRole: "operador",      action: "upload",              entity: "Documento", entityCode: "LAU-001", date: "2024-11-28 17:30", ip: "192.168.1.45",  terminal: "TERMINAL-LAB01",   detail: "Falha no processamento OCR após upload." },
  { id: 7,  userId: 1, userName: "admin@tsea.com.br",       userDisplayName: "Administrador TSEA", tagCode: "TSEA-0001", userRole: "administrador", action: "exclusao",            entity: "Documento", entityCode: "RASCUNHO", date: "2024-11-25 09:00", ip: "192.168.1.10",  terminal: "DESKTOP-ADM01",    detail: "Exclusão lógica do rascunho." },
  { id: 8,  userId: 2, userName: "engenharia@tsea.com.br",  userDisplayName: "Eng. Carlos Silva",  tagCode: "TSEA-2041", userRole: "supervisor",    action: "alteracao",           entity: "Documento", entityCode: "PRO-002", date: "2024-11-20 11:00", ip: "192.168.1.22",  terminal: "NOTEBOOK-ENG01",   detail: "Metadados atualizados pelo supervisor." },
  { id: 9,  userId: 1, userName: "admin@tsea.com.br",       userDisplayName: "Administrador TSEA", tagCode: "TSEA-0001", userRole: "administrador", action: "criacao_usuario",     entity: "Usuário",   entityCode: "João Lima", date: "2024-11-15 09:00", ip: "192.168.1.10",  terminal: "DESKTOP-ADM01",    detail: "Novo usuário criado com perfil Operador." },
  { id: 10, userId: 5, userName: "financeiro@tsea.com.br",  userDisplayName: "João Lima",          tagCode: "TSEA-3302", userRole: "operador",      action: "visualizacao",        entity: "Documento", entityCode: "CON-001", date: "2024-11-10 15:10", ip: "192.168.2.5",   terminal: "PC-FIN01",         detail: "Visualização da nota fiscal." },
  { id: 11, userId: 6, userName: "operacoes@tsea.com.br",   userDisplayName: "Operações Campo",    tagCode: "TSEA-0505", userRole: "operador",      action: "falha_login",         entity: "Sistema",   entityCode: "-",       date: "2024-11-08 06:55", ip: "192.168.1.50",  terminal: "TERMINAL-CAMPO01", detail: "Tentativa de login com senha incorreta." },
  { id: 12, userId: 1, userName: "admin@tsea.com.br",       userDisplayName: "Administrador TSEA", tagCode: "TSEA-0001", userRole: "administrador", action: "alteracao_permissao", entity: "Usuário",   entityCode: "lab@tsea", date: "2024-11-05 14:00", ip: "192.168.1.10",  terminal: "DESKTOP-ADM01",    detail: "Perfil alterado de Supervisor para Operador." },
];

// ── Usuários ──────────────────────────────────────────────────────────────────

export const rolePermissions: Record<Role, string[]> = {
  administrador: ["Visualizar documentos", "Pesquisar", "Upload", "Publicar revisão", "Excluir documentos", "Gerenciar usuários", "Alterar permissões", "Visualizar logs", "Configurar sistema"],
  supervisor: ["Visualizar documentos", "Pesquisar", "Download", "Visualizar revisões antigas", "Visualizar logs", "Validar operações"],
  operador: ["Visualizar documentos", "Pesquisar", "Download", "Registrar conclusão de lote"],
};

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  tagCode: string;
  role: Role;
  group: string;
  active: boolean;
  lastAccess: string;
  createdAt: string;
}

export const mockUsers: SystemUser[] = [
  { id: 1, name: "Administrador TSEA", email: "admin@tsea.com.br",      tagCode: "TSEA-0001", role: "administrador", group: "Administradores",   active: true,  lastAccess: "Hoje, 14:32",  createdAt: "2023-01-01" },
  { id: 2, name: "Eng. Carlos Silva",  email: "engenharia@tsea.com.br", tagCode: "TSEA-2041", role: "supervisor",    group: "Engenharia",        active: true,  lastAccess: "Hoje, 13:15",  createdAt: "2023-03-10" },
  { id: 3, name: "RH Paula Costa",     email: "rh@tsea.com.br",         tagCode: "TSEA-1088", role: "operador",      group: "Recursos Humanos",  active: true,  lastAccess: "Ontem, 10:22", createdAt: "2023-04-05" },
  { id: 4, name: "João Lima",          email: "financeiro@tsea.com.br", tagCode: "TSEA-3302", role: "operador",      group: "Financeiro",        active: true,  lastAccess: "Há 2 dias",    createdAt: "2023-05-20" },
  { id: 5, name: "Laboratório Técnico",email: "lab@tsea.com.br",        tagCode: "TSEA-4421", role: "operador",      group: "Engenharia",        active: false, lastAccess: "Há 5 dias",    createdAt: "2023-06-01" },
  { id: 6, name: "Operações Campo",    email: "operacoes@tsea.com.br",  tagCode: "TSEA-0505", role: "operador",      group: "Operações",         active: true,  lastAccess: "Hoje, 08:00",  createdAt: "2023-07-15" },
];

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export const dashboardStats = {
  totalDocuments: 312,
  thisMonth: 24,
  processing: 3,
  errors: 1,
  storageUsed: "4.7 GB",
  storageTotal: "20 GB",
  storagePercent: 24,
  pendingBatches: 2,
  activeUsers: 5,
};
