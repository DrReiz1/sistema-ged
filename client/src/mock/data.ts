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
}

export const mockDocumentTypes: DocumentType[] = [
  { id: 1, name: "Desenho Técnico", description: "Plantas, esquemas e desenhos de engenharia" },
  { id: 2, name: "Procedimento", description: "Procedimentos operacionais e de manutenção" },
  { id: 3, name: "Instrução de Trabalho", description: "Instruções passo a passo para operadores" },
  { id: 4, name: "Checklist", description: "Listas de verificação e inspeção" },
  { id: 5, name: "Relatório", description: "Relatórios técnicos e laudos" },
  { id: 6, name: "ART / RRT", description: "Anotação de Responsabilidade Técnica" },
  { id: 7, name: "Certificado", description: "Certificados de calibração, treinamento etc." },
  { id: 8, name: "Contrato", description: "Contratos e documentos legais" },
];

// ── Correspondentes ───────────────────────────────────────────────────────────

export interface Correspondent {
  id: number;
  name: string;
  description: string;
}

export const mockCorrespondents: Correspondent[] = [
  { id: 1, name: "TSEA Engenharia", description: "Departamento interno de engenharia" },
  { id: 2, name: "TSEA Operações", description: "Departamento de operações industriais" },
  { id: 3, name: "RH TSEA", description: "Recursos humanos" },
  { id: 4, name: "Energisa", description: "Concessionária de energia elétrica" },
  { id: 5, name: "CREA-SP", description: "Conselho Regional de Engenharia" },
  { id: 6, name: "ABB Ltda.", description: "Fornecedor de equipamentos elétricos" },
  { id: 7, name: "Cerâmica Norte SA", description: "Cliente industrial" },
  { id: 8, name: "Laboratório Eletro", description: "Laboratório de ensaios elétricos" },
  { id: 9, name: "Inmetro Cert.", description: "Certificação metrológica" },
];

// ── Caminhos de Armazenamento ─────────────────────────────────────────────────

export interface StoragePath {
  id: number;
  path: string;
  description: string;
}

export const mockStoragePaths: StoragePath[] = [
  { id: 1, path: "engenharia/desenhos", description: "Desenhos técnicos de engenharia" },
  { id: 2, path: "engenharia/projetos", description: "Projetos e memoriais descritivos" },
  { id: 3, path: "producao/motores/lote-a", description: "Documentos do lote A de motores" },
  { id: 4, path: "producao/motores/lote-b", description: "Documentos do lote B de motores" },
  { id: 5, path: "producao/inspecao", description: "Relatórios de inspeção da produção" },
  { id: 6, path: "qualidade/inspecoes", description: "Inspeções do setor de qualidade" },
  { id: 7, path: "qualidade/certificados", description: "Certificados e calibrações" },
  { id: 8, path: "manutencao/preventiva", description: "Planos de manutenção preventiva" },
  { id: 9, path: "manutencao/corretiva", description: "Ordens de serviço corretivas" },
  { id: 10, path: "rh/treinamentos", description: "Certificados de treinamento" },
  { id: 11, path: "juridico/contratos", description: "Contratos e documentos jurídicos" },
  { id: 12, path: "compras/notas-fiscais", description: "Notas fiscais de compras" },
];

// ── Tags ──────────────────────────────────────────────────────────────────────

export const mockTags = [
  "Contrato", "Manutenção", "2024", "2025", "Inspeção", "Transformador",
  "ART", "Rede BT", "Industrial", "Solar", "Fotovoltaico", "Projeto",
  "NR-10", "Treinamento", "Segurança", "NF", "Compras", "Planta",
  "Laudo", "OS", "Proposta", "Calibração", "Preventiva", "Corretiva",
  "Alta Tensão", "Subestação", "Checklist", "Vigente",
];

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
  correspondentId: number;
  typeId: number;
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
    id: 1, code: "DES-1001", title: "Planta Unifilar Subestação SE-01", description: "Planta unifilar completa da subestação SE-01 com todos os disjuntores e chaves.",
    correspondentId: 1, typeId: 1, storagePathId: 1, tags: ["Planta", "Subestação", "Alta Tensão", "2024"],
    created: "2024-01-15", added: "2024-01-16", pages: 6, status: "indexado", fileType: "PDF", currentRevision: "REV04", isFavorite: true,
    versions: [
      { id: 101, documentId: 1, revision: "REV04", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-04-10 09:00", isCurrent: true, changeDescription: "Atualização do ramal de entrada conforme projeto aprovado.", checksum: "8f34f2ab-22cd-41e3-9a1b-f0d8c3e7a291", size: "8.7 MB", filePath: "/storage/documents/2024/8f34f2ab-22cd.pdf" },
      { id: 102, documentId: 1, revision: "REV03", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2023-11-20 14:30", isCurrent: false, changeDescription: "Correção do esquema de aterramento.", checksum: "a12bc3d4-ef56-7890-abcd-ef1234567890", size: "8.2 MB", filePath: "/storage/documents/2023/a12bc3d4-ef56.pdf" },
      { id: 103, documentId: 1, revision: "REV02", uploadedBy: "admin@tsea.com.br", uploadedAt: "2023-06-05 10:00", isCurrent: false, changeDescription: "Revisão geral pós-vistoria CREA.", checksum: "b23cd4e5-fg67-8901-bcde-fg2345678901", size: "7.9 MB", filePath: "/storage/documents/2023/b23cd4e5-fg67.pdf" },
      { id: 104, documentId: 1, revision: "REV01", uploadedBy: "admin@tsea.com.br", uploadedAt: "2023-01-10 08:00", isCurrent: false, changeDescription: "Versão inicial do projeto.", checksum: "c34de5f6-gh78-9012-cdef-gh3456789012", size: "7.1 MB", filePath: "/storage/documents/2023/c34de5f6-gh78.pdf" },
    ],
  },
  {
    id: 2, code: "PRO-2010", title: "Procedimento de Manutenção Preventiva SE-01", description: "Procedimento completo para execução da manutenção preventiva semestral da subestação SE-01.",
    correspondentId: 2, typeId: 2, storagePathId: 8, tags: ["Manutenção", "Preventiva", "Subestação", "2024"],
    created: "2024-02-01", added: "2024-02-02", pages: 12, status: "indexado", fileType: "PDF", currentRevision: "REV02", isFavorite: true,
    versions: [
      { id: 201, documentId: 2, revision: "REV02", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-02-01 11:00", isCurrent: true, changeDescription: "Inclusão de EPI obrigatório para cada etapa.", checksum: "d45ef6g7-hi89-0123-defg-hi4567890123", size: "2.4 MB", filePath: "/storage/documents/2024/d45ef6g7-hi89.pdf" },
      { id: 202, documentId: 2, revision: "REV01", uploadedBy: "admin@tsea.com.br", uploadedAt: "2023-03-15 09:30", isCurrent: false, changeDescription: "Versão inicial.", checksum: "e56fg7h8-ij90-1234-efgh-ij5678901234", size: "2.1 MB", filePath: "/storage/documents/2023/e56fg7h8-ij90.pdf" },
    ],
  },
  {
    id: 3, code: "ITP-3005", title: "Instrução de Trabalho — Troca de Fusível NH", description: "Passo a passo para troca segura de fusíveis NH em painéis de baixa tensão.",
    correspondentId: 2, typeId: 3, storagePathId: 3, tags: ["NR-10", "Segurança", "Instrução", "2025"],
    created: "2025-01-10", added: "2025-01-10", pages: 4, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 301, documentId: 3, revision: "REV01", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2025-01-10 08:00", isCurrent: true, changeDescription: "Versão inicial aprovada pelo supervisor.", checksum: "f67gh8i9-jk01-2345-fghi-jk6789012345", size: "0.9 MB", filePath: "/storage/documents/2025/f67gh8i9-jk01.pdf" },
    ],
  },
  {
    id: 4, code: "CHK-4001", title: "Checklist Inspeção Diária — Painel CC", description: "Lista de verificação para inspeção diária dos painéis de corrente contínua.",
    correspondentId: 2, typeId: 4, storagePathId: 6, tags: ["Checklist", "Inspeção", "Preventiva"],
    created: "2024-03-05", added: "2024-03-05", pages: 2, status: "indexado", fileType: "PDF", currentRevision: "REV03", isFavorite: true,
    versions: [
      { id: 401, documentId: 4, revision: "REV03", uploadedBy: "operacoes@tsea.com.br", uploadedAt: "2024-12-01 07:30", isCurrent: true, changeDescription: "Adição de itens de verificação de temperatura.", checksum: "g78hi9j0-kl12-3456-ghij-kl7890123456", size: "0.5 MB", filePath: "/storage/documents/2024/g78hi9j0-kl12.pdf" },
      { id: 402, documentId: 4, revision: "REV02", uploadedBy: "operacoes@tsea.com.br", uploadedAt: "2024-07-10 08:00", isCurrent: false, changeDescription: "Revisão de layout para impressão A4.", checksum: "h89ij0k1-lm23-4567-hijk-lm8901234567", size: "0.4 MB", filePath: "/storage/documents/2024/h89ij0k1-lm23.pdf" },
      { id: 403, documentId: 4, revision: "REV01", uploadedBy: "admin@tsea.com.br", uploadedAt: "2024-03-05 09:00", isCurrent: false, changeDescription: "Versão inicial.", checksum: "i90jk1l2-mn34-5678-ijkl-mn9012345678", size: "0.4 MB", filePath: "/storage/documents/2024/i90jk1l2-mn34.pdf" },
    ],
  },
  {
    id: 5, code: "LAU-5002", title: "Laudo Técnico — Cabo XLPE 15kV Lote 22", description: "Laudo de ensaio dielétrico do cabo XLPE 15kV do lote 22, aprovado para instalação.",
    correspondentId: 8, typeId: 5, storagePathId: 6, tags: ["Laudo", "Cabo", "Alta Tensão"],
    created: "2024-04-28", added: "2024-04-28", pages: 15, status: "erro", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 501, documentId: 5, revision: "REV01", uploadedBy: "lab@tsea.com.br", uploadedAt: "2024-04-28 17:30", isCurrent: true, changeDescription: "Versão inicial — erro no processamento OCR.", checksum: "j01kl2m3-no45-6789-jklm-no0123456789", size: "3.3 MB", filePath: "/storage/documents/2024/j01kl2m3-no45.pdf" },
    ],
  },
  {
    id: 6, code: "ART-6010", title: "ART — Ampliação Rede BT Setor Industrial", description: "Anotação de Responsabilidade Técnica para obra de ampliação da rede de baixa tensão.",
    correspondentId: 5, typeId: 6, storagePathId: 1, tags: ["ART", "Rede BT", "Industrial", "2024"],
    created: "2024-04-10", added: "2024-04-10", pages: 3, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 601, documentId: 6, revision: "REV01", uploadedBy: "admin@tsea.com.br", uploadedAt: "2024-04-10 14:00", isCurrent: true, changeDescription: "Versão inicial registrada no CREA-SP.", checksum: "k12lm3n4-op56-7890-klmn-op1234567890", size: "0.9 MB", filePath: "/storage/documents/2024/k12lm3n4-op56.pdf" },
    ],
  },
  {
    id: 7, code: "CER-7003", title: "NR-10 — Certificado Treinamento Equipe Campo", description: "Certificado de treinamento NR-10 Básico + SEP para os operadores de campo.",
    correspondentId: 3, typeId: 7, storagePathId: 10, tags: ["NR-10", "Treinamento", "Segurança", "Certificado"],
    created: "2024-04-20", added: "2024-04-20", pages: 5, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 701, documentId: 7, revision: "REV01", uploadedBy: "rh@tsea.com.br", uploadedAt: "2024-04-20 10:00", isCurrent: true, changeDescription: "Versão inicial.", checksum: "l23mn4o5-pq67-8901-lmno-pq2345678901", size: "1.2 MB", filePath: "/storage/documents/2024/l23mn4o5-pq67.pdf" },
    ],
  },
  {
    id: 8, code: "MEM-8001", title: "Memorial Descritivo — Projeto Fotovoltaico 150kW", description: "Memorial descritivo completo do projeto de geração solar de 150kW instalado no galpão industrial.",
    correspondentId: 1, typeId: 2, storagePathId: 2, tags: ["Solar", "Fotovoltaico", "Projeto", "2024"],
    created: "2024-04-18", added: "2024-04-19", pages: 24, status: "processando", fileType: "PDF", currentRevision: "REV02", isFavorite: false,
    versions: [
      { id: 801, documentId: 8, revision: "REV02", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-04-18 16:00", isCurrent: true, changeDescription: "Atualização do memorial com especificação dos inversores Fronius.", checksum: "m34no5p6-qr78-9012-mnop-qr3456789012", size: "5.1 MB", filePath: "/storage/documents/2024/m34no5p6-qr78.pdf" },
      { id: 802, documentId: 8, revision: "REV01", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-02-10 09:00", isCurrent: false, changeDescription: "Versão inicial do memorial.", checksum: "n45op6q7-rs89-0123-nopq-rs4567890123", size: "4.8 MB", filePath: "/storage/documents/2024/n45op6q7-rs89.pdf" },
    ],
  },
  {
    id: 9, code: "OS-9087", title: "Ordem de Serviço 2024-087 — Manutenção Preventiva TR-07", description: "Ordem de serviço para manutenção preventiva semestral do transformador TR-07.",
    correspondentId: 2, typeId: 2, storagePathId: 8, tags: ["OS", "Manutenção", "Preventiva", "Transformador"],
    created: "2024-05-01", added: "2024-05-01", pages: 4, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 901, documentId: 9, revision: "REV01", uploadedBy: "operacoes@tsea.com.br", uploadedAt: "2024-05-01 07:00", isCurrent: true, changeDescription: "Versão inicial da OS.", checksum: "o56pq7r8-st90-1234-opqr-st5678901234", size: "1.0 MB", filePath: "/storage/documents/2024/o56pq7r8-st90.pdf" },
    ],
  },
  {
    id: 10, code: "NF-10042", title: "Nota Fiscal — Equipamentos SE-03 ABB", description: "Nota fiscal referente à compra de disjuntores e IHMs para a subestação SE-03.",
    correspondentId: 6, typeId: 8, storagePathId: 12, tags: ["NF", "Compras", "Equipamento", "2024"],
    created: "2024-04-22", added: "2024-04-22", pages: 2, status: "indexado", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 1001, documentId: 10, revision: "REV01", uploadedBy: "financeiro@tsea.com.br", uploadedAt: "2024-04-22 15:00", isCurrent: true, changeDescription: "Versão inicial.", checksum: "p67qr8s9-tu01-2345-pqrs-tu6789012345", size: "0.5 MB", filePath: "/storage/documents/2024/p67qr8s9-tu01.pdf" },
    ],
  },
  {
    id: 11, code: "CER-7008", title: "Certificado Calibração Alicate Amperímetro SN-4421", description: "Certificado de calibração do alicate amperímetro nº série 4421 emitido pelo Inmetro.",
    correspondentId: 9, typeId: 7, storagePathId: 7, tags: ["Calibração", "Instrumento", "Certificado"],
    created: "2024-05-10", added: "2024-05-10", pages: 2, status: "processando", fileType: "PDF", currentRevision: "REV01", isFavorite: false,
    versions: [
      { id: 1101, documentId: 11, revision: "REV01", uploadedBy: "lab@tsea.com.br", uploadedAt: "2024-05-10 11:00", isCurrent: true, changeDescription: "Versão inicial.", checksum: "q78rs9t0-uv12-3456-qrst-uv7890123456", size: "0.7 MB", filePath: "/storage/documents/2024/q78rs9t0-uv12.pdf" },
    ],
  },
  {
    id: 12, code: "PRO-2015", title: "PMOC — Plano de Manutenção Ar Condicionado", description: "Plano de manutenção e operação e controle dos equipamentos de ar condicionado.",
    correspondentId: 2, typeId: 2, storagePathId: 8, tags: ["PMOC", "Manutenção", "Preventiva"],
    created: "2024-05-07", added: "2024-05-07", pages: 9, status: "indexado", fileType: "PDF", currentRevision: "REV02", isFavorite: false,
    versions: [
      { id: 1201, documentId: 12, revision: "REV02", uploadedBy: "engenharia@tsea.com.br", uploadedAt: "2024-05-07 14:00", isCurrent: true, changeDescription: "Atualização do cronograma de manutenção.", checksum: "r89st0u1-vw23-4567-rstu-vw8901234567", size: "2.0 MB", filePath: "/storage/documents/2024/r89st0u1-vw23.pdf" },
      { id: 1202, documentId: 12, revision: "REV01", uploadedBy: "admin@tsea.com.br", uploadedAt: "2023-09-01 10:00", isCurrent: false, changeDescription: "Versão inicial.", checksum: "s90tu1v2-wx34-5678-stuv-wx9012345678", size: "1.8 MB", filePath: "/storage/documents/2023/s90tu1v2-wx34.pdf" },
    ],
  },
];

// ── Conclusões de Lote ────────────────────────────────────────────────────────

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
  { id: 1, documentId: 3, documentCode: "ITP-3005", documentTitle: "Instrução de Trabalho — Troca de Fusível NH", operatorName: "Operações Campo", operatorEmail: "operacoes@tsea.com.br", completedAt: "2025-01-11 07:45", batchCode: "LOTE-2025-001", notes: "Concluído sem intercorrências. EPI utilizado conforme instrução." },
  { id: 2, documentId: 4, documentCode: "CHK-4001", documentTitle: "Checklist Inspeção Diária — Painel CC", operatorName: "Operações Campo", operatorEmail: "operacoes@tsea.com.br", completedAt: "2025-01-11 08:30", batchCode: "INSP-2025-011", notes: "Todos os itens verificados. Temperatura normal." },
  { id: 3, documentId: 9, documentCode: "OS-9087", documentTitle: "Ordem de Serviço 2024-087", operatorName: "Eng. Carlos Silva", operatorEmail: "engenharia@tsea.com.br", completedAt: "2024-05-03 17:00", batchCode: "OS-2024-087", notes: "Manutenção executada. Próxima revisão: novembro/2024." },
];

// ── Auditoria ─────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
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
  { id: 1, userId: 1, userName: "admin@tsea.com.br", userRole: "administrador", action: "login", entity: "Sistema", entityCode: "-", date: "2025-01-11 14:32", ip: "192.168.1.10", terminal: "DESKTOP-ADM01", detail: "Login realizado com sucesso." },
  { id: 2, userId: 1, userName: "admin@tsea.com.br", userRole: "administrador", action: "upload", entity: "Documento", entityCode: "ITP-3005", date: "2025-01-11 14:35", ip: "192.168.1.10", terminal: "DESKTOP-ADM01", detail: "Upload da revisão REV01 do documento ITP-3005." },
  { id: 3, userId: 2, userName: "engenharia@tsea.com.br", userRole: "supervisor", action: "visualizacao", entity: "Documento", entityCode: "DES-1001", date: "2025-01-11 13:15", ip: "192.168.1.22", terminal: "NOTEBOOK-ENG01", detail: "Visualização da revisão vigente REV04." },
  { id: 4, userId: 3, userName: "rh@tsea.com.br", userRole: "operador", action: "download", entity: "Documento", entityCode: "CER-7003", date: "2025-01-10 10:22", ip: "192.168.1.31", terminal: "PC-RH01", detail: "Download do arquivo original REV01." },
  { id: 5, userId: 1, userName: "admin@tsea.com.br", userRole: "administrador", action: "publicacao_revisao", entity: "Documento", entityCode: "CHK-4001", date: "2024-12-01 07:35", ip: "192.168.1.10", terminal: "DESKTOP-ADM01", detail: "Publicação da REV03 como versão vigente." },
  { id: 6, userId: 4, userName: "lab@tsea.com.br", userRole: "operador", action: "upload", entity: "Documento", entityCode: "LAU-5002", date: "2024-11-28 17:30", ip: "192.168.1.45", terminal: "TERMINAL-LAB01", detail: "Falha no processamento OCR após upload." },
  { id: 7, userId: 1, userName: "admin@tsea.com.br", userRole: "administrador", action: "exclusao", entity: "Documento", entityCode: "RASCUNHO-SE04", date: "2024-11-25 09:00", ip: "192.168.1.10", terminal: "DESKTOP-ADM01", detail: "Exclusão lógica do rascunho." },
  { id: 8, userId: 2, userName: "engenharia@tsea.com.br", userRole: "supervisor", action: "alteracao", entity: "Documento", entityCode: "MEM-8001", date: "2024-11-20 11:00", ip: "192.168.1.22", terminal: "NOTEBOOK-ENG01", detail: "Correspondente atualizado para TSEA Engenharia." },
  { id: 9, userId: 1, userName: "admin@tsea.com.br", userRole: "administrador", action: "criacao_usuario", entity: "Usuário", entityCode: "operacoes@tsea.com.br", date: "2024-11-15 09:00", ip: "192.168.1.10", terminal: "DESKTOP-ADM01", detail: "Novo usuário criado com perfil Operador." },
  { id: 10, userId: 5, userName: "financeiro@tsea.com.br", userRole: "operador", action: "visualizacao", entity: "Documento", entityCode: "NF-10042", date: "2024-11-10 15:10", ip: "192.168.2.5", terminal: "PC-FIN01", detail: "Visualização da nota fiscal." },
  { id: 11, userId: 6, userName: "operacoes@tsea.com.br", userRole: "operador", action: "falha_login", entity: "Sistema", entityCode: "-", date: "2024-11-08 06:55", ip: "192.168.1.50", terminal: "TERMINAL-CAMPO01", detail: "Tentativa de login com senha incorreta." },
  { id: 12, userId: 1, userName: "admin@tsea.com.br", userRole: "administrador", action: "alteracao_permissao", entity: "Usuário", entityCode: "lab@tsea.com.br", date: "2024-11-05 14:00", ip: "192.168.1.10", terminal: "DESKTOP-ADM01", detail: "Perfil alterado de Supervisor para Operador." },
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
  role: Role;
  group: string;
  active: boolean;
  lastAccess: string;
  createdAt: string;
}

export const mockUsers: SystemUser[] = [
  { id: 1, name: "Administrador TSEA", email: "admin@tsea.com.br", role: "administrador", group: "Administradores", active: true, lastAccess: "Hoje, 14:32", createdAt: "2023-01-01" },
  { id: 2, name: "Eng. Carlos Silva", email: "engenharia@tsea.com.br", role: "supervisor", group: "Engenharia", active: true, lastAccess: "Hoje, 13:15", createdAt: "2023-03-10" },
  { id: 3, name: "RH Paula Costa", email: "rh@tsea.com.br", role: "operador", group: "Recursos Humanos", active: true, lastAccess: "Ontem, 10:22", createdAt: "2023-04-05" },
  { id: 4, name: "Financeiro João Lima", email: "financeiro@tsea.com.br", role: "operador", group: "Financeiro", active: true, lastAccess: "Há 2 dias", createdAt: "2023-05-20" },
  { id: 5, name: "Laboratório Técnico", email: "lab@tsea.com.br", role: "operador", group: "Engenharia", active: false, lastAccess: "Há 5 dias", createdAt: "2023-06-01" },
  { id: 6, name: "Operações Campo", email: "operacoes@tsea.com.br", role: "operador", group: "Operações", active: true, lastAccess: "Hoje, 08:00", createdAt: "2023-07-15" },
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
