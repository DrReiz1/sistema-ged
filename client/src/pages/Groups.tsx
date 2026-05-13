import { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Shield, Eye, Edit3, Trash2, CheckCircle, XCircle } from "lucide-react";
import { mockUsers, rolePermissions, type Role } from "@/mock/data";

const roleBadge: Record<Role, string> = {
  administrador: "bg-purple-100 text-purple-700",
  supervisor:    "bg-blue-100 text-blue-700",
  operador:      "bg-gray-100 text-gray-600",
};

const roleLabel: Record<Role, string> = {
  administrador: "Administrador",
  supervisor:    "Supervisor",
  operador:      "Operador",
};

const groups = ["Todos", "Administradores", "Engenharia", "Recursos Humanos", "Financeiro", "Operações"];

export function Groups() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");

  const filtered = mockUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchGroup = selectedGroup === "Todos" || u.group === selectedGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Grupos e Usuários</h1>
        <button className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]" data-testid="button-add-user">
          <UserPlus size={14} /> Novo Usuário
        </button>
      </div>

      {/* RBAC Matrix */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Shield size={14} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Perfis e Permissões (RBAC)</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 p-5">
          {(["operador", "supervisor", "administrador"] as Role[]).map((role) => (
            <div key={role} className={`rounded-xl border p-4 ${
              role === "administrador" ? "border-purple-200 bg-purple-50/40" :
              role === "supervisor"    ? "border-blue-200 bg-blue-50/40" :
                                        "border-gray-200 bg-gray-50/40"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${roleBadge[role]}`}>
                  <Shield size={10} /> {roleLabel[role]}
                </span>
                <span className="text-[10px] text-gray-400">{mockUsers.filter((u) => u.role === role).length} usuário(s)</span>
              </div>
              <ul className="space-y-1.5">
                {rolePermissions[role].map((perm) => (
                  <li key={perm} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle size={11} className="flex-shrink-0 text-emerald-500" /> {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Group filter + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button key={g} onClick={() => setSelectedGroup(g)} data-testid={`filter-group-${g}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedGroup === g ? "bg-[#FF201A] text-white border border-[#bf0f0c]" : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-gray-300"
              }`}>
              {g}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input data-testid="input-user-search" placeholder="Pesquisar usuários..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] shadow-sm" />
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {["Usuário", "Grupo", "Perfil", "Status", "Cadastro", "Último acesso", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <motion.tr key={user.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors" data-testid={`row-user-${user.id}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF201A] text-[11px] font-bold text-white">
                      {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-[11px] text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{user.group}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleBadge[user.role]}`}>
                    <Shield size={10} /> {roleLabel[user.role]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {user.active
                    ? <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600"><CheckCircle size={12} /> Ativo</span>
                    : <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400"><XCircle size={12} /> Inativo</span>}
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">{user.createdAt}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{user.lastAccess}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Eye size={14} /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Edit3 size={14} /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
