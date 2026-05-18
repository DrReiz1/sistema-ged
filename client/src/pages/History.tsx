import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CreditCard,
  Download,
  Edit3,
  Eye,
  FileText,
  GitBranch,
  Key,
  Lock,
  LogIn,
  LogOut,
  Search,
  Tag,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import { fetchJson } from "@/lib/queryClient";
import { type ApiDocument, type ApiLog, formatDate } from "@/lib/docstation";

const actionMeta: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  login: { label: "Login", icon: <LogIn size={14} />, bg: "bg-blue-50", color: "text-blue-600" },
  logout: { label: "Logout", icon: <LogOut size={14} />, bg: "bg-gray-50", color: "text-gray-500" },
  login_rfid: { label: "Login por crachá", icon: <CreditCard size={14} />, bg: "bg-cyan-50", color: "text-cyan-600" },
  falha_login: { label: "Falha de login", icon: <AlertTriangle size={14} />, bg: "bg-red-50", color: "text-red-500" },
  upload: { label: "Documento publicado", icon: <Upload size={14} />, bg: "bg-indigo-50", color: "text-indigo-600" },
  download: { label: "Download", icon: <Download size={14} />, bg: "bg-emerald-50", color: "text-emerald-600" },
  visualizacao: { label: "Visualização", icon: <Eye size={14} />, bg: "bg-sky-50", color: "text-sky-600" },
  alteracao: { label: "Alteração", icon: <Edit3 size={14} />, bg: "bg-amber-50", color: "text-amber-600" },
  exclusao: { label: "Exclusão", icon: <Trash2 size={14} />, bg: "bg-red-50", color: "text-red-600" },
  publicacao_revisao: { label: "Nova revisão", icon: <GitBranch size={14} />, bg: "bg-purple-50", color: "text-purple-600" },
  alteracao_permissao: { label: "Permissão", icon: <Lock size={14} />, bg: "bg-orange-50", color: "text-orange-600" },
  criacao_usuario: { label: "Novo usuário", icon: <UserPlus size={14} />, bg: "bg-teal-50", color: "text-teal-600" },
  troca_senha: { label: "Senha", icon: <Key size={14} />, bg: "bg-yellow-50", color: "text-yellow-600" },
  user_create: { label: "Novo usuário", icon: <UserPlus size={14} />, bg: "bg-teal-50", color: "text-teal-600" },
  document_create: { label: "Novo documento", icon: <Upload size={14} />, bg: "bg-indigo-50", color: "text-indigo-600" },
  bootstrap: { label: "Inicialização", icon: <GitBranch size={14} />, bg: "bg-purple-50", color: "text-purple-600" },
  category_create: { label: "Nova categoria", icon: <FileText size={14} />, bg: "bg-slate-50", color: "text-slate-600" },
  tag_create: { label: "Nova tag", icon: <Tag size={14} />, bg: "bg-pink-50", color: "text-pink-600" },
  group_create: { label: "Novo grupo", icon: <Lock size={14} />, bg: "bg-orange-50", color: "text-orange-600" },
  conclusao_lote: { label: "Conclusão de lote", icon: <GitBranch size={14} />, bg: "bg-emerald-50", color: "text-emerald-700" },
  preferencias_interface: { label: "Preferências", icon: <Edit3 size={14} />, bg: "bg-indigo-50", color: "text-indigo-700" },
};

export function History() {
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");

  const { data: currentUser } = useQuery<{ id: string; username: string; role: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });

  const { data: logs = [] } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
    queryFn: () => fetchJson<ApiLog[]>("/api/logs"),
  });

  const { data: documents = [] } = useQuery<ApiDocument[]>({
    queryKey: ["/api/documents"],
    queryFn: () => fetchJson<ApiDocument[]>("/api/documents"),
  });

  const isAdmin = currentUser?.role === "admin";

  const filtered = logs.filter((entry) => {
    const document = documents.find((item) => item.id === entry.documentId);
    const query = search.toLowerCase();
    const bag = [
      entry.userName ?? "",
      document?.code ?? "",
      document?.title ?? "",
      entry.action,
      isAdmin ? (entry.device ?? "") : "",
      isAdmin ? (entry.ipAddress ?? "") : "",
    ].join(" ").toLowerCase();

    const matchSearch = !query || bag.includes(query);
    const matchAction = selectedAction === "all" || entry.action === selectedAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Histórico</h1>
        <p className="mt-1 text-sm text-gray-400">
          {isAdmin ? "Auditoria completa do sistema" : "Histórico operacional dos grupos sob sua responsabilidade"}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="input-history-search"
              placeholder="Buscar por responsável, documento ou ação..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-700 focus:border-[#FF201A] focus:outline-none"
            />
          </div>
          <select
            value={selectedAction}
            onChange={(event) => setSelectedAction(event.target.value)}
            data-testid="select-action"
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 focus:border-[#FF201A] focus:outline-none"
          >
            <option value="all">Todas as ações</option>
            {Object.entries(actionMeta).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <span className="flex items-center px-1 text-sm text-gray-400">{filtered.length} registro(s)</span>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((entry, index) => {
          const meta = actionMeta[entry.action] ?? {
            label: entry.action,
            icon: <CreditCard size={14} />,
            bg: "bg-gray-50",
            color: "text-gray-600",
          };
          const document = documents.find((item) => item.id === entry.documentId);
          const actorName = entry.userName ?? "Usuário do sistema";

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300 md:p-5"
              data-testid={`row-history-${entry.id}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-gray-800">{actorName}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    {document && (
                      <>
                        <span className="font-mono text-sm font-bold text-[#FF201A]">{document.code}</span>
                        <span className="text-xs text-gray-500">{document.title}</span>
                      </>
                    )}
                    {isAdmin && !document && entry.documentId && (
                      <span className="text-xs text-gray-400">{entry.documentId}</span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1">
                        <CreditCard size={12} className="text-gray-500" />
                        <span className="font-mono text-xs font-bold text-gray-600">{entry.ipAddress ?? "local"}</span>
                      </div>
                      <span className="truncate text-xs text-gray-400">{entry.device ?? "Dispositivo não informado"}</span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="whitespace-nowrap text-xs font-semibold text-gray-500">{formatDate(entry.timestamp).split(",")[0]}</p>
                  <p className="mt-0.5 text-sm font-bold text-gray-700">{formatDate(entry.timestamp).split(",")[1]?.trim() ?? ""}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-gray-400 shadow-sm">
            <Search size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p className="text-base font-medium">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
