import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, ChevronRight, Upload, Clock, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/queryClient";
import { type ApiDocument, type ApiLog, formatDate, mapStatusClass, mapStatusLabel } from "@/lib/docstation";
import { getRole, roleConfig } from "@/lib/roles";

const actionColor: Record<string, string> = {
  login: "bg-sky-100 text-sky-700",
  document_create: "bg-emerald-100 text-emerald-700",
  bootstrap: "bg-purple-100 text-purple-700",
  document_delete: "bg-red-100 text-red-700",
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate("/documents?q=" + encodeURIComponent(search));
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Início</h1>
        <p className="text-sm text-gray-500 mt-1">Bem-vindo ao sistema de gestão de documentos da TSEA</p>
      </div>

      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-600 mb-3">Busca rápida</p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input data-testid="input-home-search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, título ou descrição..."
              className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] focus:ring-1 focus:ring-[#FF201A]/20 transition-all" />
          </div>
          <button type="submit" data-testid="button-home-search"
            className="h-12 px-6 rounded-lg bg-[#FF201A] text-white text-sm font-semibold hover:bg-[#e01a14] transition-colors border border-[#bf0f0c] whitespace-nowrap">
            Buscar
          </button>
        </form>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-4">
        {[
          { label: "Total de documentos", value: stats.totalDocuments, color: "bg-[#FF201A]" },
          { label: "Adicionados este mês", value: stats.thisMonth, color: "bg-blue-500" },
          { label: "Em processamento", value: stats.processing, color: "bg-amber-500" },
          { label: "Usuários ativos", value: stats.activeUsers, color: "bg-emerald-500" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 md:p-5 flex items-center gap-4">
            <div className={`h-12 w-1.5 rounded-full flex-shrink-0 ${s.color}`} />
            <div className="min-w-0">
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Documentos recentes</h2>
              </div>
              <Link href="/documents">
                <button className="flex items-center gap-1 text-xs text-[#FF201A] hover:underline font-medium">
                  Ver todos <ChevronRight size={12} />
                </button>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recent.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.id}`}>
                  <div data-testid={`doc-recent-${doc.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                      <FileText size={16} className="text-[#FF201A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400 font-mono">{doc.code}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{doc.currentRevision?.revisionNumber ?? "SEM REV"}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate">{doc.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${mapStatusClass(doc.status)}`}>
                        {mapStatusLabel(doc.status)}
                      </span>
                      <span className="hidden sm:inline text-xs text-gray-400">{doc.category?.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          {perms.canUpload && (
            <Link href="/upload">
              <button data-testid="button-publish-document"
                className="w-full flex items-center justify-center gap-2 h-13 py-3.5 rounded-xl bg-[#FF201A] text-white text-sm font-semibold hover:bg-[#e01a14] transition-colors border border-[#bf0f0c] shadow-sm">
                <Upload size={17} /> Publicar documento
              </button>
            </Link>
          )}

          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Atividade recente</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800">{log.userId}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CreditCard size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[11px] font-mono font-semibold text-gray-500">{log.ipAddress ?? "local"}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{formatDate(log.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${actionColor[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                      {log.action}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FF201A]">{log.documentId ?? "-"}</span>
                    <span className="text-[11px] text-blue-600 font-semibold">{log.revisionId ?? "-"}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{log.device ?? "Dispositivo não informado"}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
