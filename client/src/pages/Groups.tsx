import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Shield, CheckCircle, XCircle, X } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiGroup, type ApiUser } from "@/lib/docstation";

const roleBadge: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  supervisor: "bg-blue-100 text-blue-700",
  operator: "bg-gray-100 text-gray-600",
};

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operator: "Operador",
};

const rolePermissions: Record<string, string[]> = {
  admin: ["Visualizar documentos", "Criar documentos", "Gerenciar usuários", "Gerenciar grupos", "Visualizar logs"],
  supervisor: ["Visualizar documentos", "Publicar revisões", "Visualizar logs", "Acompanhar grupos"],
  operator: ["Visualizar documentos liberados", "Consultar revisão vigente", "Registrar conclusão de lote"],
};

export function Groups() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator",
    sector: "",
    rfidTag: "",
  });

  const { data: users = [] } = useQuery<ApiUser[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetchJson<ApiUser[]>("/api/users"),
  });

  const { data: groups = [] } = useQuery<ApiGroup[]>({
    queryKey: ["/api/groups"],
    queryFn: () => fetchJson<ApiGroup[]>("/api/groups"),
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const userResponse = await apiRequest("POST", "/api/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        sector: form.sector,
        rfidTag: form.rfidTag || undefined,
        active: true,
      });

      const user = await userResponse.json() as ApiUser;
      await Promise.all(
        selectedGroupIds.map((groupId) => (
          apiRequest("POST", "/api/groups/permissions", { userId: user.id, groupId })
        )),
      );

      return user;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setForm({ name: "", email: "", password: "", role: "operator", sector: "", rfidTag: "" });
      setSelectedGroupIds([]);
      setShowForm(false);
    },
  });

  const availableGroups = ["Todos", ...groups.map((group) => group.name), "Sem grupo"];

  const filtered = users.filter((user) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || user.name.toLowerCase().includes(q)
      || user.email.toLowerCase().includes(q)
      || user.sector.toLowerCase().includes(q);
    const groupNames = user.groups.map((group) => group.name);
    const matchGroup = selectedGroup === "Todos"
      || (selectedGroup === "Sem grupo" && groupNames.length === 0)
      || groupNames.includes(selectedGroup);

    return matchSearch && matchGroup;
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createUserMutation.mutate();
  };

  const toggleAssignedGroup = (groupId: string) => {
    setSelectedGroupIds((current) => (
      current.includes(groupId)
        ? current.filter((item) => item !== groupId)
        : [...current, groupId]
    ));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Grupos operacionais e usuários</h1>
        <button className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]" onClick={() => setShowForm((value) => !value)}>
          <UserPlus size={14} /> Novo usuário
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Novo usuário operacional</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nome completo" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" />
              <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="E-mail" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" />
              <input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Senha inicial" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" />
              <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]">
                <option value="operator">Operador</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
              <input value={form.sector} onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))} placeholder="Área técnica (ex.: Transformadores)" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" />
              <input value={form.rfidTag} onChange={(event) => setForm((prev) => ({ ...prev, rfidTag: event.target.value }))} placeholder="RFID (opcional)" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Grupos liberados para o usuário</label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleAssignedGroup(group.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedGroupIds.includes(group.id)
                        ? "bg-[#FF201A] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                O usuário verá apenas os documentos vinculados aos grupos selecionados.
              </p>
            </div>

            {createUserMutation.isError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Não foi possível salvar o usuário.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e01a14]">
                {createUserMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Shield size={14} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Perfis e permissões</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          {(["operator", "supervisor", "admin"] as const).map((role) => (
            <div key={role} className={`rounded-xl border p-4 ${
              role === "admin" ? "border-purple-200 bg-purple-50/40" :
              role === "supervisor" ? "border-blue-200 bg-blue-50/40" :
              "border-gray-200 bg-gray-50/40"
            }`}>
              <div className="mb-3 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${roleBadge[role]}`}>
                  <Shield size={10} /> {roleLabel[role]}
                </span>
                <span className="text-[10px] text-gray-400">{users.filter((user) => user.role === role).length} usuário(s)</span>
              </div>
              <ul className="space-y-1.5">
                {rolePermissions[role].map((permission) => (
                  <li key={permission} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle size={11} className="flex-shrink-0 text-emerald-500" /> {permission}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {availableGroups.map((group) => (
            <button key={group} onClick={() => setSelectedGroup(group)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedGroup === group ? "bg-[#FF201A] text-white border border-[#bf0f0c]" : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-gray-300"
              }`}>
              {group}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Pesquisar usuários..." value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-[#FF201A]" />
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {["Usuário", "Grupos", "Perfil", "Status", "Cadastro", "Área técnica"].map((header) => (
                <th key={header} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, index) => (
              <motion.tr key={user.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF201A] text-[11px] font-bold text-white">
                      {user.name.split(" ").map((name) => name[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-[11px] text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">
                  {user.groups.length > 0 ? user.groups.map((group) => group.name).join(", ") : "Sem grupo"}
                </td>
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
                <td className="px-5 py-3 text-xs text-gray-400">{new Intl.DateTimeFormat("pt-BR").format(new Date(user.createdAt))}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{user.sector}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
