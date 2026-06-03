import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Clock3, FileSearch, FileText, Search, Upload, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { fetchJson } from "@/lib/queryClient";
import { type ApiDocument, type ApiLog, formatDate, mapStatusClass, mapStatusLabel } from "@/lib/docstation";
import { getRole, roleConfig } from "@/lib/roles";

const actionColor: Record<string, string> = {
  login: "bg-slate-100 text-slate-700",
  upload: "bg-emerald-100 text-emerald-700",
  publicacao_revisao: "bg-blue-100 text-blue-700",
  bootstrap: "bg-violet-100 text-violet-700",
  exclusao: "bg-rose-100 text-rose-700",
  download: "bg-amber-100 text-amber-700",
  visualizacao: "bg-cyan-100 text-cyan-700",
  app_access_granted: "bg-teal-100 text-teal-700",
  app_access_denied: "bg-red-100 text-red-700",
  app_documents_viewed: "bg-lime-100 text-lime-700",
  app_module_selected: "bg-orange-100 text-orange-700",
};

const actionLabel: Record<string, string> = {
  login: "Entrou no sistema",
  logout: "Saiu do sistema",
  login_rfid: "Entrou com cracha",
  falha_login: "Falha de acesso",
  upload: "Publicou documento",
  download: "Baixou documento",
  visualizacao: "Abriu documento",
  alteracao: "Fez alteracao",
  exclusao: "Excluiu documento",
  publicacao_revisao: "Publicou nova revisao",
  alteracao_permissao: "Atualizou permissoes",
  criacao_usuario: "Criou usuario",
  category_create: "Criou categoria",
  tag_create: "Criou etiqueta",
  group_create: "Criou grupo",
  conclusao_lote: "Registrou conclusao",
  preferencias_interface: "Salvou preferencias",
  bootstrap: "Preparou a base",
  app_access_granted: "Liberou acesso ao app",
  app_access_denied: "Recusou acesso ao app",
  app_documents_viewed: "Consultou documentos do app",
  app_module_selected: "Selecionou modulo do app",
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
    .slice(0, 5);

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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="operator-surface overflow-hidden rounded-[18px] border border-white/70 p-5 md:p-7"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-5">
            <div className="border-l-4 border-[#FF201A] pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Painel principal</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">Painel principal</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Consulte documentos vigentes, acompanhe o fluxo operacional e acesse rapidamente as rotinas do GED.
              </p>
            </div>

            <form onSubmit={handleSearch} className="rounded-[16px] border border-slate-300 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    data-testid="input-home-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por codigo, titulo ou descricao"
                    className="operator-action h-14 w-full rounded-xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-base text-gray-700 transition-all focus:border-[#FF201A] focus:outline-none focus:ring-2 focus:ring-[#FF201A]/15"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="button-home-search"
                  className="operator-action h-14 min-w-[176px] rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-6 text-base font-semibold text-white transition-colors hover:bg-[#e01a14]"
                >
                  Buscar documento
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link href="/documents">
                <button className="operator-card operator-action flex min-h-[98px] w-full items-center gap-4 rounded-[16px] border border-slate-300 px-4 py-4 text-left transition-all hover:border-slate-400 hover:shadow-md">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-700">
                    <FileSearch size={24} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-800">Abrir documentos</p>
                    <p className="mt-1 text-sm text-gray-500">Consultar a base documental.</p>
                  </div>
                </button>
              </Link>

              {perms.canUpload && (
                <Link href="/upload">
                  <button className="operator-card operator-action flex min-h-[98px] w-full items-center gap-4 rounded-[16px] border border-slate-300 px-4 py-4 text-left transition-all hover:border-slate-400 hover:shadow-md">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-700">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-800">Publicar documento</p>
                      <p className="mt-1 text-sm text-gray-500">Enviar novo arquivo ou revisao.</p>
                    </div>
                  </button>
                </Link>
              )}

              <Link href="/groups">
                <button className="operator-card operator-action flex min-h-[98px] w-full items-center gap-4 rounded-[16px] border border-slate-300 px-4 py-4 text-left transition-all hover:border-slate-400 hover:shadow-md">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-700">
                    <UsersRound size={24} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-800">Usuarios</p>
                    <p className="mt-1 text-sm text-gray-500">Gerenciar acessos e equipes.</p>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          <div className="rounded-[16px] border border-[#bf0f0c]/15 bg-[#fff4f3] p-5 text-gray-900">
            <div className="border-b border-[#bf0f0c]/10 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#bf0f0c]/70">Resumo operacional</p>
              <p className="mt-2 text-sm text-gray-600">Indicadores do ambiente documental nesta sessao.</p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: "Documentos ativos", value: stats.totalDocuments },
                { label: "Novos no mes", value: stats.thisMonth },
                { label: "Em revisao", value: stats.processing },
                { label: "Usuario conectado", value: stats.activeUsers },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-xl border border-white/80 bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="operator-card overflow-hidden rounded-[18px] border border-slate-300"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-700">
                <Clock3 size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Documentos recentes</h2>
                <p className="text-sm text-gray-500">Ultimos arquivos disponibilizados no GED.</p>
              </div>
            </div>
            <Link href="/documents">
              <button className="operator-action rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Ver lista completa
              </button>
            </Link>
          </div>

          <div className="space-y-3 p-4 md:p-5">
            {recent.map((doc) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <div
                  data-testid={`doc-recent-${doc.id}`}
                  className="operator-action flex cursor-pointer items-center gap-4 rounded-[14px] border border-slate-300 bg-white px-4 py-4 transition-all hover:border-slate-400 hover:shadow-sm"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50">
                    <FileText size={22} className="text-slate-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-400">{doc.code}</span>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        {doc.currentRevision?.revisionNumber ?? "SEM REV"}
                      </span>
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${mapStatusClass(doc.status)}`}>
                        {mapStatusLabel(doc.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-gray-800">{doc.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{doc.category?.name ?? "Sem categoria"}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="operator-card overflow-hidden rounded-[18px] border border-slate-300"
        >
          <div className="border-b border-slate-200 px-5 py-4 md:px-6">
            <h2 className="text-base font-semibold text-gray-800">Atividade recente</h2>
            <p className="text-sm text-gray-500">Ultimos registros relevantes do sistema.</p>
          </div>
          <div className="space-y-3 p-4 md:p-5">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-[14px] border border-slate-300 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-800">{log.userName ?? "Usuario do sistema"}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold ${actionColor[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                        {actionLabel[log.action] ?? "Acao registrada"}
                      </span>
                      {log.source === "app" && (
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                          App
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400">{formatDate(log.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
