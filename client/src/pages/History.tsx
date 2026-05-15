import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Upload, Edit3, Download, Eye, Trash2, LogIn, LogOut, AlertTriangle, Key, UserPlus, GitBranch, Lock, CreditCard } from "lucide-react";
import { mockAuditLogs, type AuditAction, type Role } from "@/mock/data";

const actionMeta: Record<AuditAction, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  login:               { label: "Login",           icon: <LogIn size={14} />,        bg: "bg-blue-50",    color: "text-blue-600" },
  logout:              { label: "Logout",          icon: <LogOut size={14} />,       bg: "bg-gray-50",    color: "text-gray-500" },
  falha_login:         { label: "Falha de Login",  icon: <AlertTriangle size={14} />,bg: "bg-red-50",     color: "text-red-500" },
  upload:              { label: "Upload",          icon: <Upload size={14} />,       bg: "bg-indigo-50",  color: "text-indigo-600" },
  download:            { label: "Download",        icon: <Download size={14} />,     bg: "bg-emerald-50", color: "text-emerald-600" },
  visualizacao:        { label: "Visualização",    icon: <Eye size={14} />,          bg: "bg-sky-50",     color: "text-sky-600" },
  alteracao:           { label: "Edição",          icon: <Edit3 size={14} />,        bg: "bg-amber-50",   color: "text-amber-600" },
  exclusao:            { label: "Exclusão",        icon: <Trash2 size={14} />,       bg: "bg-red-50",     color: "text-red-600" },
  publicacao_revisao:  { label: "Nova Revisão",    icon: <GitBranch size={14} />,    bg: "bg-purple-50",  color: "text-purple-600" },
  alteracao_permissao: { label: "Permissão",       icon: <Lock size={14} />,         bg: "bg-orange-50",  color: "text-orange-600" },
  criacao_usuario:     { label: "Novo Usuário",    icon: <UserPlus size={14} />,     bg: "bg-teal-50",    color: "text-teal-600" },
  troca_senha:         { label: "Senha",           icon: <Key size={14} />,          bg: "bg-yellow-50",  color: "text-yellow-600" },
};

const roleBadge: Record<Role, string> = {
  administrador: "bg-red-100 text-[#FF201A]",
  supervisor:    "bg-amber-100 text-amber-700",
  operador:      "bg-blue-100 text-blue-700",
};

const roleLabel: Record<Role, string> = {
  administrador: "Administrador",
  supervisor:    "Supervisor",
  operador:      "Operador",
};

export function History() {
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");

  const filtered = mockAuditLogs.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      h.userDisplayName.toLowerCase().includes(q) ||
      h.tagCode.toLowerCase().includes(q) ||
      h.entityCode.toLowerCase().includes(q) ||
      h.detail.toLowerCase().includes(q);
    const matchAction = selectedAction === "all" || h.action === selectedAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Histórico</h1>
        <p className="text-sm text-gray-400 mt-1">Rastreabilidade de todas as operações do sistema</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input data-testid="input-history-search"
              placeholder="Buscar por usuário, tag, documento..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]" />
          </div>
          <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} data-testid="select-action"
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 focus:outline-none focus:border-[#FF201A]">
            <option value="all">Todas as ações</option>
            {Object.entries(actionMeta).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <span className="flex items-center text-sm text-gray-400 px-1">{filtered.length} registro(s)</span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((entry, i) => {
          const meta = actionMeta[entry.action];
          return (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 md:p-5 hover:border-gray-300 transition-colors"
              data-testid={`row-history-${entry.id}`}>
              <div className="flex items-start gap-4">
                {/* Action icon */}
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-base font-bold text-gray-800">{entry.userDisplayName}</span>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleBadge[entry.userRole]}`}>
                      {roleLabel[entry.userRole]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1">
                      <CreditCard size={12} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-600 font-mono">{entry.tagCode}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    {entry.entityCode !== "-" && (
                      <span className="font-mono text-sm font-bold text-[#FF201A]">{entry.entityCode}</span>
                    )}
                    <span className="text-xs text-gray-400">{entry.detail}</span>
                  </div>
                </div>

                {/* Time */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-500 whitespace-nowrap">{entry.date.split(" ")[0]}</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{entry.date.split(" ")[1]}</p>
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
