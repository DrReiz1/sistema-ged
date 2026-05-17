import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Upload,
  Edit3,
  Download,
  Eye,
  Trash2,
  LogIn,
  LogOut,
  AlertTriangle,
  Key,
  UserPlus,
  GitBranch,
  Lock,
  CreditCard,
  FileText,
  Tag,
} from "lucide-react";
import { fetchJson } from "@/lib/queryClient";
import { type ApiDocument, type ApiLog, type ApiUser, formatDate } from "@/lib/docstation";

const actionMeta: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  login: { label: "Login", icon: <LogIn size={14} />, bg: "bg-blue-50", color: "text-blue-600" },
  logout: { label: "Logout", icon: <LogOut size={14} />, bg: "bg-gray-50", color: "text-gray-500" },
  login_rfid: { label: "Login RFID", icon: <CreditCard size={14} />, bg: "bg-cyan-50", color: "text-cyan-600" },
  falha_login: { label: "Falha de login", icon: <AlertTriangle size={14} />, bg: "bg-red-50", color: "text-red-500" },
  upload: { label: "Upload", icon: <Upload size={14} />, bg: "bg-indigo-50", color: "text-indigo-600" },
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
  bootstrap: { label: "Bootstrap", icon: <GitBranch size={14} />, bg: "bg-purple-50", color: "text-purple-600" },
  category_create: { label: "Nova categoria", icon: <FileText size={14} />, bg: "bg-slate-50", color: "text-slate-600" },
  tag_create: { label: "Nova etiqueta", icon: <Tag size={14} />, bg: "bg-pink-50", color: "text-pink-600" },
  group_create: { label: "Novo grupo", icon: <Lock size={14} />, bg: "bg-orange-50", color: "text-orange-600" },
  conclusao_lote: { label: "Conclusão de lote", icon: <GitBranch size={14} />, bg: "bg-emerald-50", color: "text-emerald-700" },
  preferencias_interface: { label: "Preferências", icon: <Edit3 size={14} />, bg: "bg-indigo-50", color: "text-indigo-700" },
};

const roleBadge: Record<string, string> = {
  admin: "bg-red-100 text-[#FF201A]",
  supervisor: "bg-amber-100 text-amber-700",
  operator: "bg-blue-100 text-blue-700",
};

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operator: "Operador",
};

export function History() {
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");

  const { data: logs = [] } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
    queryFn: () => fetchJson<ApiLog[]>("/api/logs"),
  });

  const { data: users = [] } = useQuery<ApiUser[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetchJson<ApiUser[]>("/api/users"),
  });

  const { data: documents = [] } = useQuery<ApiDocument[]>({
    queryKey: ["/api/documents"],
    queryFn: () => fetchJson<ApiDocument[]>("/api/documents"),
  });

  const filtered = logs.filter((entry) => {
    const user = users.find((item) => item.id === entry.userId);
    const document = documents.find((item) => item.id === entry.documentId);
    const q = search.toLowerCase();
    const bag = [
      user?.name ?? "",
      user?.email ?? "",
      document?.code ?? "",
      document?.title ?? "",
      entry.action,
      entry.device ?? "",
      entry.ipAddress ?? "",
    ].join(" ").toLowerCase();

    const matchSearch = !q || bag.includes(q);
    const matchAction = selectedAction === "all" || entry.action === selectedAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Histórico</h1>
        <p className="text-sm text-gray-400 mt-1">Rastreabilidade de todas as operações do sistema</p>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="input-history-search"
              placeholder="Buscar por usuário, documento ou ação..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]"
            />
          </div>
          <select
            value={selectedAction}
            onChange={(event) => setSelectedAction(event.target.value)}
            data-testid="select-action"
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 focus:outline-none focus:border-[#FF201A]"
          >
            <option value="all">Todas as ações</option>
            {Object.entries(actionMeta).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <span className="flex items-center text-sm text-gray-400 px-1">{filtered.length} registro(s)</span>
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
          const user = users.find((item) => item.id === entry.userId);
          const document = documents.find((item) => item.id === entry.documentId);
          const role = user?.role ?? "operator";

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 md:p-5 hover:border-gray-300 transition-colors"
              data-testid={`row-history-${entry.id}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-base font-bold text-gray-800">{user?.name ?? entry.userId}</span>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleBadge[role] ?? roleBadge.operator}`}>
                      {roleLabel[role] ?? "Operador"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1">
                      <CreditCard size={12} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-600 font-mono">{entry.ipAddress ?? "local"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    {document && (
                      <>
                        <span className="font-mono text-sm font-bold text-[#FF201A]">{document.code}</span>
                        <span className="text-xs text-gray-500">{document.title}</span>
                      </>
                    )}
                    {!document && entry.documentId && (
                      <span className="text-xs text-gray-400">{entry.documentId}</span>
                    )}
                    <span className="text-xs text-gray-400">{entry.device ?? "Dispositivo não informado"}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-500 whitespace-nowrap">{formatDate(entry.timestamp).split(",")[0]}</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{formatDate(entry.timestamp).split(",")[1]?.trim() ?? ""}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm py-20 text-center text-gray-400">
            <Search size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p className="text-base font-medium">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
