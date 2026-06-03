import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronDown,
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
  Smartphone,
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
  login_rfid: { label: "Cracha", icon: <CreditCard size={14} />, bg: "bg-cyan-50", color: "text-cyan-600" },
  falha_login: { label: "Falha", icon: <AlertTriangle size={14} />, bg: "bg-red-50", color: "text-red-500" },
  upload: { label: "Publicacao", icon: <Upload size={14} />, bg: "bg-indigo-50", color: "text-indigo-600" },
  download: { label: "Download", icon: <Download size={14} />, bg: "bg-emerald-50", color: "text-emerald-600" },
  visualizacao: { label: "Visualizacao", icon: <Eye size={14} />, bg: "bg-sky-50", color: "text-sky-600" },
  alteracao: { label: "Alteracao", icon: <Edit3 size={14} />, bg: "bg-amber-50", color: "text-amber-600" },
  exclusao: { label: "Exclusao", icon: <Trash2 size={14} />, bg: "bg-red-50", color: "text-red-600" },
  publicacao_revisao: { label: "Nova revisao", icon: <GitBranch size={14} />, bg: "bg-purple-50", color: "text-purple-600" },
  alteracao_permissao: { label: "Permissao", icon: <Lock size={14} />, bg: "bg-orange-50", color: "text-orange-600" },
  criacao_usuario: { label: "Novo usuario", icon: <UserPlus size={14} />, bg: "bg-teal-50", color: "text-teal-600" },
  troca_senha: { label: "Senha", icon: <Key size={14} />, bg: "bg-yellow-50", color: "text-yellow-600" },
  user_create: { label: "Novo usuario", icon: <UserPlus size={14} />, bg: "bg-teal-50", color: "text-teal-600" },
  document_create: { label: "Novo documento", icon: <Upload size={14} />, bg: "bg-indigo-50", color: "text-indigo-600" },
  bootstrap: { label: "Inicializacao", icon: <GitBranch size={14} />, bg: "bg-purple-50", color: "text-purple-600" },
  category_create: { label: "Categoria", icon: <FileText size={14} />, bg: "bg-slate-50", color: "text-slate-600" },
  tag_create: { label: "Etiqueta", icon: <Tag size={14} />, bg: "bg-pink-50", color: "text-pink-600" },
  group_create: { label: "Grupo", icon: <Lock size={14} />, bg: "bg-orange-50", color: "text-orange-600" },
  conclusao_lote: { label: "Conclusao", icon: <GitBranch size={14} />, bg: "bg-emerald-50", color: "text-emerald-700" },
  preferencias_interface: { label: "Preferencias", icon: <Edit3 size={14} />, bg: "bg-indigo-50", color: "text-indigo-700" },
  app_access_granted: { label: "App liberado", icon: <Smartphone size={14} />, bg: "bg-cyan-50", color: "text-cyan-700" },
  app_access_denied: { label: "App bloqueado", icon: <AlertTriangle size={14} />, bg: "bg-rose-50", color: "text-rose-700" },
  app_documents_viewed: { label: "Consulta no app", icon: <Smartphone size={14} />, bg: "bg-lime-50", color: "text-lime-700" },
  app_module_selected: { label: "Modulo do app", icon: <Smartphone size={14} />, bg: "bg-orange-50", color: "text-orange-700" },
};

function ActionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = useMemo(
    () => [{ value: "all", label: "Todas as acoes" }, ...Object.entries(actionMeta).map(([key, meta]) => ({ value: key, label: meta.label }))],
    [],
  );
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative w-full md:w-[260px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="operator-action flex h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-4 text-left text-base text-gray-700 hover:border-slate-400"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-300 bg-white p-2 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex min-h-[48px] w-full items-center justify-between rounded-lg px-3 text-sm transition-colors ${
                value === option.value ? "bg-slate-100 font-semibold text-slate-800" : "text-gray-600 hover:bg-slate-50"
              }`}
            >
              <span className="truncate pr-3">{option.label}</span>
              {value === option.value && <Check size={14} className="flex-shrink-0 text-slate-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
      entry.source ?? "",
      isAdmin ? (entry.device ?? "") : "",
      isAdmin ? (entry.ipAddress ?? "") : "",
    ].join(" ").toLowerCase();

    const matchSearch = !query || bag.includes(query);
    const matchAction = selectedAction === "all" || entry.action === selectedAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="operator-surface rounded-[18px] border border-white/70 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Rastreabilidade</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Historico</h1>
            <p className="mt-2 text-sm text-gray-500">
              {isAdmin ? "Acompanhe as acoes registradas no sistema." : "Acompanhe as acoes da sua area."}
            </p>
          </div>
          <div className="rounded-xl bg-[#fff4f3] px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filtered.length}</span> registro(s)
          </div>
        </div>
      </section>

      <div className="operator-card rounded-[18px] border border-gray-200 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="input-history-search"
              placeholder="Buscar por pessoa, documento ou acao"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-base text-gray-700 focus:border-[#FF201A] focus:outline-none"
            />
          </div>
          <ActionSelect value={selectedAction} onChange={setSelectedAction} />
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
          const actorName = entry.userName ?? "Usuario do sistema";

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="operator-card rounded-[18px] border border-gray-200 p-5"
              data-testid={`row-history-${entry.id}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-gray-800">{actorName}</p>
                    <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${entry.source === "app" ? "bg-cyan-50 text-cyan-700" : "bg-gray-100 text-gray-600"}`}>
                      {entry.source === "app" ? "App" : "GED"}
                    </span>
                    <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    {document ? (
                      <>
                        <span className="font-mono font-bold text-[#FF201A]">{document.code}</span>
                        <span>{document.title}</span>
                      </>
                    ) : (
                      <span>Acao sem documento vinculado</span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                      <span className="rounded-lg bg-gray-100 px-3 py-1">{entry.ipAddress ?? "local"}</span>
                      <span className="rounded-lg bg-gray-100 px-3 py-1">{entry.device ?? "dispositivo nao informado"}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="whitespace-nowrap text-xs font-semibold text-gray-500">{formatDate(entry.timestamp).split(",")[0]}</p>
                  <p className="mt-1 text-sm font-bold text-gray-700">{formatDate(entry.timestamp).split(",")[1]?.trim() ?? ""}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="operator-card rounded-[18px] border border-gray-200 py-20 text-center text-gray-400">
            <Search size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p className="text-base font-medium">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
