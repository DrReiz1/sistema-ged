import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Upload, Edit3, Download, Eye, Trash2, LogIn, LogOut, AlertTriangle, Key, UserPlus, GitBranch, Lock, Shield } from "lucide-react";
import { mockAuditLogs, type AuditAction, type Role } from "@/mock/data";

const actionMeta: Record<AuditAction, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  login:               { label: "Login",           icon: <LogIn size={12} />,        bg: "bg-blue-50",    color: "text-blue-600" },
  logout:              { label: "Logout",          icon: <LogOut size={12} />,       bg: "bg-gray-50",    color: "text-gray-500" },
  falha_login:         { label: "Falha de Login",  icon: <AlertTriangle size={12} />, bg: "bg-red-50",    color: "text-red-500" },
  upload:              { label: "Upload",          icon: <Upload size={12} />,       bg: "bg-indigo-50",  color: "text-indigo-600" },
  download:            { label: "Download",        icon: <Download size={12} />,     bg: "bg-emerald-50", color: "text-emerald-600" },
  visualizacao:        { label: "Visualização",    icon: <Eye size={12} />,          bg: "bg-sky-50",     color: "text-sky-600" },
  alteracao:           { label: "Edição",          icon: <Edit3 size={12} />,        bg: "bg-amber-50",   color: "text-amber-600" },
  exclusao:            { label: "Exclusão",        icon: <Trash2 size={12} />,       bg: "bg-red-50",     color: "text-red-600" },
  publicacao_revisao:  { label: "Publicação Rev.", icon: <GitBranch size={12} />,    bg: "bg-purple-50",  color: "text-purple-600" },
  alteracao_permissao: { label: "Alt. Permissão", icon: <Lock size={12} />,         bg: "bg-orange-50",  color: "text-orange-600" },
  criacao_usuario:     { label: "Novo Usuário",    icon: <UserPlus size={12} />,     bg: "bg-teal-50",    color: "text-teal-600" },
  troca_senha:         { label: "Troca de Senha",  icon: <Key size={12} />,          bg: "bg-yellow-50",  color: "text-yellow-600" },
};

const roleBadge: Record<Role, string> = {
  administrador: "bg-purple-100 text-purple-700",
  supervisor:    "bg-blue-100 text-blue-700",
  operador:      "bg-gray-100 text-gray-600",
};

const roleLabel: Record<Role, string> = {
  administrador: "Admin",
  supervisor:    "Supervisor",
  operador:      "Operador",
};

export function History() {
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");

  const filtered = mockAuditLogs.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.userName.toLowerCase().includes(q) || h.entity.toLowerCase().includes(q) || h.entityCode.toLowerCase().includes(q) || h.terminal.toLowerCase().includes(q);
    const matchAction = selectedAction === "all" || h.action === selectedAction;
    const matchRole = selectedRole === "all" || h.userRole === selectedRole;
    return matchSearch && matchAction && matchRole;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Histórico de Auditoria</h1>

      {/* Filters */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input data-testid="input-history-search" placeholder="Usuário, documento, terminal..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]" />
          </div>
          <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} data-testid="select-action"
            className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 focus:outline-none focus:border-[#FF201A]">
            <option value="all">Todas as ações</option>
            {Object.entries(actionMeta).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} data-testid="select-role"
            className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 focus:outline-none focus:border-[#FF201A]">
            <option value="all">Todos os perfis</option>
            <option value="administrador">Administrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="operador">Operador</option>
          </select>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} registro(s)</span>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Ação", "Usuário / Perfil", "Entidade", "Data / Hora", "IP", "Terminal", "Detalhe"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const meta = actionMeta[entry.action];
                return (
                  <motion.tr key={entry.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors" data-testid={`row-history-${entry.id}`}>
                    <td className="px-5 py-3">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-medium text-gray-700">{entry.userName}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold mt-0.5 ${roleBadge[entry.userRole]}`}>
                        <Shield size={9} /> {roleLabel[entry.userRole]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-gray-500">{entry.entity}</p>
                      {entry.entityCode !== "-" && <p className="font-mono text-[11px] font-bold text-[#FF201A]">{entry.entityCode}</p>}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{entry.date}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{entry.ip}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{entry.terminal}</td>
                    <td className="px-5 py-3 max-w-[180px]"><p className="truncate text-xs text-gray-500">{entry.detail}</p></td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
