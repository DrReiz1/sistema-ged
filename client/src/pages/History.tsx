import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Edit3, Download, Eye, Trash2, Search, Shield, LogIn, LogOut, AlertTriangle, Key, UserPlus, GitBranch, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockAuditLogs, type AuditAction, type Role } from "@/mock/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const actionMeta: Record<AuditAction, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  login:               { label: "Login",               icon: <LogIn size={12} />,      bg: "bg-blue-50",    color: "text-blue-600" },
  logout:              { label: "Logout",              icon: <LogOut size={12} />,     bg: "bg-gray-50",    color: "text-gray-500" },
  falha_login:         { label: "Falha de Login",      icon: <AlertTriangle size={12}/>, bg: "bg-red-50",   color: "text-red-500" },
  upload:              { label: "Upload",              icon: <Upload size={12} />,     bg: "bg-indigo-50",  color: "text-indigo-600" },
  download:            { label: "Download",            icon: <Download size={12} />,   bg: "bg-emerald-50", color: "text-emerald-600" },
  visualizacao:        { label: "Visualização",        icon: <Eye size={12} />,        bg: "bg-sky-50",     color: "text-sky-600" },
  alteracao:           { label: "Edição",              icon: <Edit3 size={12} />,      bg: "bg-amber-50",   color: "text-amber-600" },
  exclusao:            { label: "Exclusão",            icon: <Trash2 size={12} />,     bg: "bg-red-50",     color: "text-red-600" },
  publicacao_revisao:  { label: "Publicação Rev.",     icon: <GitBranch size={12} />,  bg: "bg-purple-50",  color: "text-purple-600" },
  alteracao_permissao: { label: "Alt. Permissão",      icon: <Lock size={12} />,       bg: "bg-orange-50",  color: "text-orange-600" },
  criacao_usuario:     { label: "Novo Usuário",        icon: <UserPlus size={12} />,   bg: "bg-teal-50",    color: "text-teal-600" },
  troca_senha:         { label: "Troca de Senha",      icon: <Key size={12} />,        bg: "bg-yellow-50",  color: "text-yellow-600" },
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
    const matchSearch = !q ||
      h.userName.toLowerCase().includes(q) ||
      h.entity.toLowerCase().includes(q) ||
      h.entityCode.toLowerCase().includes(q) ||
      h.detail.toLowerCase().includes(q) ||
      h.terminal.toLowerCase().includes(q);
    const matchAction = selectedAction === "all" || h.action === selectedAction;
    const matchRole = selectedRole === "all" || h.userRole === selectedRole;
    return matchSearch && matchAction && matchRole;
  });

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                data-testid="input-history-search"
                placeholder="Usuário, documento, terminal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="h-9 w-44 text-sm" data-testid="select-action">
                <SelectValue placeholder="Tipo de ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {Object.entries(actionMeta).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-9 w-36 text-sm" data-testid="select-role">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="operador">Operador</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-gray-400">{filtered.length} registro(s)</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ação</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Usuário / Perfil</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Entidade</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Data / Hora</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">IP</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Terminal</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const meta = actionMeta[entry.action];
                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 transition hover:bg-gray-50/60"
                    data-testid={`row-history-${entry.id}`}
                  >
                    <td className="px-5 py-3">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-medium text-gray-700">{entry.userName}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${roleBadge[entry.userRole]}`}>
                        <Shield size={9} /> {roleLabel[entry.userRole]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-gray-500">{entry.entity}</p>
                      <p className="font-mono text-[11px] font-bold text-[#FF201A]">{entry.entityCode !== "-" ? entry.entityCode : ""}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">{entry.date}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{entry.ip}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{entry.terminal}</td>
                    <td className="px-5 py-3 max-w-[180px]">
                      <p className="truncate text-xs text-gray-500">{entry.detail}</p>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
