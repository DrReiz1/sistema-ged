import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Search, Shield, Eye, Edit3, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUsers } from "@/mock/data";

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
};

const roleBadge: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  editor: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

const groups = ["Todos", "Administradores", "Engenharia", "Recursos Humanos", "Financeiro", "Operações"];

export function Groups() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchGroup = selectedGroup === "Todos" || u.group === selectedGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedGroup === g
                  ? "bg-[#FF201A] text-white"
                  : "bg-white text-gray-600 shadow-sm border border-gray-200 hover:border-gray-300"
              }`}
              data-testid={`filter-group-${g}`}
            >
              {g}
            </button>
          ))}
        </div>
        <Button className="gap-2 bg-[#FF201A] text-sm text-white hover:bg-[#e01a14]" size="sm" data-testid="button-add-user">
          <UserPlus size={14} /> Novo Usuário
        </Button>
      </div>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              data-testid="input-user-search"
              placeholder="Pesquisar usuários..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Usuário</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Grupo</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Perfil</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Último acesso</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-50 transition hover:bg-gray-50/60"
                  data-testid={`row-user-${user.id}`}
                >
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
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users size={13} className="text-gray-400" />
                      {user.group}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleBadge[user.role]}`}>
                      <Shield size={10} />
                      {roleLabel[user.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle size={12} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                        <XCircle size={12} /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{user.lastAccess}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600" title="Visualizar">
                        <Eye size={14} />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600" title="Editar">
                        <Edit3 size={14} />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-red-50 hover:text-red-500" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
