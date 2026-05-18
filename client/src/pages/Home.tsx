import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Clock, FileText, Search, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import { fetchJson } from "@/lib/queryClient";
import { type ApiDocument, type ApiLog, formatDate, mapStatusClass, mapStatusLabel } from "@/lib/docstation";
import { getRole, roleConfig } from "@/lib/roles";

const actionColor: Record<string, string> = {
  login: "bg-sky-100 text-sky-700",
  upload: "bg-emerald-100 text-emerald-700",
  publicacao_revisao: "bg-blue-100 text-blue-700",
  bootstrap: "bg-purple-100 text-purple-700",
  exclusao: "bg-red-100 text-red-700",
  download: "bg-amber-100 text-amber-700",
  visualizacao: "bg-indigo-100 text-indigo-700",
};

const actionLabel: Record<string, string> = {
  login: "Login realizado",
  logout: "Logout realizado",
  login_rfid: "Acesso por crachá",
  falha_login: "Falha de autenticação",
  upload: "Documento publicado",
  download: "Documento baixado",
  visualizacao: "Documento visualizado",
  alteracao: "Alteração realizada",
  exclusao: "Documento excluído",
  publicacao_revisao: "Nova revisão publicada",
  alteracao_permissao: "Permissões atualizadas",
  criacao_usuario: "Usuário criado",
  category_create: "Categoria criada",
  tag_create: "Tag criada",
  group_create: "Grupo criado",
  conclusao_lote: "Conclusão de lote registrada",
  preferencias_interface: "Preferências salvas",
  bootstrap: "Base inicial carregada",
};

export function Home() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  const { data: user } = useQuery<{ id: string; username: string; role: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });
  const role = getRole(user?.role);
  const perms = roleConfig[role];

  const { data: documents = [] } = useQuery<ApiDocument[]>({
    queryKey: ["/api/documents"],
    queryFn: () => fetchJson<ApiDocument[]>("/api/documents"),
  });

  const { data: logs = [] } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
    queryFn: () => fetchJson<ApiLog[]>("/api/logs"),
    enabled: perms.canViewLogs,
  });

  const recent = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const stats = {
    totalDocuments: documents.length,
    thisMonth: documents.filter((document) => {
      const createdAt = new Date(document.createdAt);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length,
    processing: documents.filter((document) => document.status === "draft").length,
    activeUsers: user ? 1 : 0,
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (search.trim()) {
      navigate(`/documents?q=${encodeURIComponent(search)}`);
    }
  };

  const resolveActorName = (log: ApiLog) => {
    return log.userName ?? "Usuário do sistema";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Início</h1>
        <p className="mt-1 text-sm text-gray-500">Bem-vindo ao sistema de gestão de documentos da TSEA</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <p className="mb-3 text-sm font-semibold text-gray-600">Busca rápida</p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="input-home-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, título ou descrição..."
              className="h-12 w-full rounded-lg border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm text-gray-700 transition-all focus:border-[#FF201A] focus:outline-none focus:ring-1 focus:ring-[#FF201A]/20"
            />
          </div>
          <button
            type="submit"
            data-testid="button-home-search"
            className="h-12 whitespace-nowrap rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#e01a14]"
          >
            Buscar
          </button>
        </form>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {[
          { label: "Total de documentos", value: stats.totalDocuments, color: "bg-[#FF201A]" },
          { label: "Adicionados este mês", value: stats.thisMonth, color: "bg-blue-500" },
          { label: "Em processamento", value: stats.processing, color: "bg-amber-500" },
          { label: "Usuários ativos", value: stats.activeUsers, color: "bg-emerald-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
          >
            <div className={`h-12 w-1.5 flex-shrink-0 rounded-full ${stat.color}`} />
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-800 md:text-3xl">{stat.value}</p>
              <p className="mt-0.5 text-xs leading-tight text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Documentos recentes</h2>
              </div>
              <Link href="/documents">
                <button className="flex items-center gap-1 text-xs font-medium text-[#FF201A] hover:underline">
                  Ver todos <ChevronRight size={12} />
                </button>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recent.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.id}`}>
                  <div
                    data-testid={`doc-recent-${doc.id}`}
                    className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                      <FileText size={16} className="text-[#FF201A]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-gray-400">{doc.code}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {doc.currentRevision?.revisionNumber ?? "SEM REV"}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-gray-700">{doc.title}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${mapStatusClass(doc.status)}`}>
                        {mapStatusLabel(doc.status)}
                      </span>
                      <span className="hidden text-xs text-gray-400 sm:inline">{doc.category?.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {perms.canUpload && (
            <Link href="/upload">
              <button
                data-testid="button-publish-document"
                className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-[#bf0f0c] bg-[#FF201A] py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e01a14]"
              >
                <Upload size={17} /> Publicar documento
              </button>
            </Link>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-700">Atividade recente</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">{resolveActorName(log)}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${actionColor[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                        {actionLabel[log.action] ?? "Ação registrada"}
                      </span>
                    </div>
                    <span className="mt-0.5 flex-shrink-0 text-[10px] text-gray-400">{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
