import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CheckCircle, Layers3, Search, Shield, UserPlus, X, XCircle } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiCategory, type ApiGroup, type ApiUser } from "@/lib/docstation";

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

function toInputDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function defaultAccessDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toInputDate(date.toISOString());
}

function accessSummary(user: ApiUser) {
  const activeCategories = user.appAccess
    .filter((entry) => entry.enabled)
    .map((entry) => entry.category?.prefix)
    .filter(Boolean);

  if (activeCategories.length === 0) {
    return "Nenhum tipo liberado";
  }

  return activeCategories.join(", ");
}

export function Groups() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [showUserForm, setShowUserForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedUserForApp, setSelectedUserForApp] = useState<ApiUser | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [appAccessUntil, setAppAccessUntil] = useState(defaultAccessDate());
  const [appAccessEnabled, setAppAccessEnabled] = useState(true);
  const [employeeActive, setEmployeeActive] = useState(true);
  const [nfcCode, setNfcCode] = useState("");
  const [nfcActive, setNfcActive] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator",
    sector: "",
    operatorId: "",
    rfidTag: "",
  });
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
  });

  const { data: users = [] } = useQuery<ApiUser[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetchJson<ApiUser[]>("/api/users"),
  });

  const { data: groups = [] } = useQuery<ApiGroup[]>({
    queryKey: ["/api/groups"],
    queryFn: () => fetchJson<ApiGroup[]>("/api/groups"),
  });

  const { data: categories = [] } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
    queryFn: () => fetchJson<ApiCategory[]>("/api/categories"),
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        sector: form.sector,
        operatorId: form.operatorId,
        rfidTag: form.rfidTag || undefined,
        active: true,
      });

      const user = await response.json() as ApiUser;
      await Promise.all(
        selectedGroupIds.map((groupId) => apiRequest("POST", "/api/groups/permissions", { userId: user.id, groupId })),
      );

      return user;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setForm({ name: "", email: "", password: "", role: "operator", sector: "", operatorId: "", rfidTag: "" });
      setSelectedGroupIds([]);
      setShowUserForm(false);
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/groups", {
        name: groupForm.name,
        description: groupForm.description || undefined,
      });

      return response.json() as Promise<ApiGroup>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setGroupForm({ name: "", description: "" });
      setShowGroupForm(false);
    },
  });

  const syncAppAccessMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserForApp) {
        throw new Error("Nenhum funcionario selecionado.");
      }

      const response = await apiRequest("PUT", `/api/app/users/${selectedUserForApp.id}/access`, {
        categoryIds: selectedCategoryIds,
        accessUntil: appAccessUntil ? `${appAccessUntil}T23:59:59.000Z` : null,
        enabled: appAccessEnabled,
        employeeActive,
        nfcCode: nfcCode.trim() || null,
        nfcActive,
      });

      return response.json();
    },
    onSuccess: async (updatedAccess) => {
      if (selectedUserForApp) {
        queryClient.setQueryData<ApiUser[]>(["/api/users"], (current = []) =>
          current.map((user) =>
            user.id === selectedUserForApp.id
              ? {
                  ...user,
                  appProfile: {
                    employeeActive,
                    nfcCode: nfcCode.trim() || null,
                    nfcActive,
                  },
                  appAccess: updatedAccess,
                }
              : user,
          ),
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setSelectedUserForApp(null);
      setSelectedCategoryIds([]);
      setAppAccessUntil(defaultAccessDate());
      setAppAccessEnabled(true);
      setEmployeeActive(true);
      setNfcCode("");
      setNfcActive(true);
    },
  });

  const availableGroups = useMemo(() => ["Todos", ...groups.map((group) => group.name), "Sem grupo"], [groups]);

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const internalGroupNames = user.groups.map((group) => group.name);
    const matchSearch = !query
      || user.name.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
      || user.operatorId.toLowerCase().includes(query)
      || user.sector.toLowerCase().includes(query);
    const matchGroup = selectedGroup === "Todos"
      || (selectedGroup === "Sem grupo" && internalGroupNames.length === 0)
      || internalGroupNames.includes(selectedGroup);

    return matchSearch && matchGroup;
  });

  const toggleSelection = (id: string, current: string[], setter: (value: string[]) => void) => {
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleUserSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createUserMutation.mutate();
  };

  const handleGroupSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createGroupMutation.mutate();
  };

  const openAppAccessModal = (user: ApiUser) => {
    setSelectedUserForApp(user);
    setSelectedCategoryIds(user.appAccess.filter((entry) => entry.enabled).map((entry) => entry.categoryId));
    setAppAccessUntil(user.appAccess[0]?.accessUntil ? toInputDate(user.appAccess[0].accessUntil) : defaultAccessDate());
    setAppAccessEnabled(user.appAccess.some((entry) => entry.enabled));
    setEmployeeActive(user.appProfile.employeeActive);
    setNfcCode(user.appProfile.nfcCode ?? user.rfidTag ?? "");
    setNfcActive(user.appProfile.nfcActive);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="operator-surface rounded-[18px] border border-white/70 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Usuários</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="mt-2 text-sm text-gray-500">Cadastre pessoas, grupos do GED e acesso ao app.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="operator-action h-14 rounded-xl border border-gray-200 bg-white px-5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setShowGroupForm((value) => !value)}
            >
              <span className="inline-flex items-center gap-2">
                <Layers3 size={18} /> Novo grupo
              </span>
            </button>
            <button
              className="operator-action h-14 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white transition-colors hover:bg-[#e01a14]"
              onClick={() => setShowUserForm((value) => !value)}
            >
              <span className="inline-flex items-center gap-2">
                <UserPlus size={18} /> Novo usuario
              </span>
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showGroupForm && (
          <motion.form
            onSubmit={handleGroupSubmit}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="operator-card rounded-[18px] border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Novo grupo do GED</h2>
              <button type="button" onClick={() => setShowGroupForm(false)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={groupForm.name}
                onChange={(event) => setGroupForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nome do grupo"
                className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
              />
              <input
                value={groupForm.description}
                onChange={(event) => setGroupForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Descrição do grupo"
                className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
              />
            </div>

            {createGroupMutation.isError && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Não foi possível salvar o grupo.
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowGroupForm(false)} className="operator-action h-12 rounded-xl border border-gray-200 px-5 text-base font-medium text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="operator-action h-12 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white hover:bg-[#e01a14]">
                {createGroupMutation.isPending ? "Salvando..." : "Salvar grupo"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUserForm && (
          <motion.form
            onSubmit={handleUserSubmit}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="operator-card rounded-[18px] border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Novo usuario</h2>
              <button type="button" onClick={() => setShowUserForm(false)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nome completo" className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none" />
              <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="E-mail" className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none" />
              <input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Senha inicial" className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none" />
              <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none">
                <option value="operator">Operador</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
              <input value={form.operatorId} onChange={(event) => setForm((prev) => ({ ...prev, operatorId: event.target.value }))} placeholder="ID do operador" className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none" />
              <input value={form.rfidTag} onChange={(event) => setForm((prev) => ({ ...prev, rfidTag: event.target.value }))} placeholder="Código NFC / RFID" className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none" />
              <input value={form.sector} onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))} placeholder="Área técnica" className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none md:col-span-2" />
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Grupos no GED</label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleSelection(group.id, selectedGroupIds, setSelectedGroupIds)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      selectedGroupIds.includes(group.id)
                        ? "bg-[#FF201A] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>

            {createUserMutation.isError && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Não foi possível salvar o usuário.
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowUserForm(false)} className="operator-action h-12 rounded-xl border border-gray-200 px-5 text-base font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="operator-action h-12 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white hover:bg-[#e01a14]">
                {createUserMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="operator-card rounded-[18px] border border-gray-200 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {availableGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  selectedGroup === group ? "border border-[#bf0f0c] bg-[#FF201A] text-white" : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Pesquisar usuarios"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-base text-gray-700 focus:border-[#FF201A] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="operator-card rounded-[18px] border border-gray-200 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FF201A] text-sm font-bold text-white">
                  {user.name.split(" ").map((name) => name[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-4 lg:flex lg:items-center lg:gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Operador</p>
                  <p className="text-sm font-semibold text-gray-700">{user.operatorId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Grupos GED</p>
                  <p className="text-sm text-gray-600">{user.groups.length > 0 ? user.groups.map((group) => group.name).join(", ") : "Sem grupo"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Acesso no app</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Layers3 size={14} className="text-blue-500" />
                    <span>{accessSummary(user)}</span>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${roleBadge[user.role]}`}>
                    <Shield size={10} /> {roleLabel[user.role]}
                  </span>
                  <div className="mt-2">
                    {user.appProfile.employeeActive
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600"><CheckCircle size={12} /> Liberado no app</span>
                      : <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400"><XCircle size={12} /> Bloqueado no app</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                NFC: {user.appProfile.nfcCode ? (user.appProfile.nfcActive ? "ativo" : "inativo") : "não cadastrado"}
              </p>
              <button
                type="button"
                onClick={() => openAppAccessModal(user)}
                className="operator-action h-11 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Configurar app
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedUserForApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-4xl rounded-[18px] border border-gray-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Configurar app</h2>
                  <p className="text-sm text-gray-400">{selectedUserForApp.name} · {selectedUserForApp.operatorId}</p>
                </div>
                <button type="button" onClick={() => setSelectedUserForApp(null)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="space-y-2 md:col-span-1">
                    <span className="text-sm font-semibold text-gray-700">Código NFC</span>
                    <input
                      value={nfcCode}
                      onChange={(event) => setNfcCode(event.target.value)}
                      placeholder="Código do crachá"
                      className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <input type="checkbox" checked={employeeActive} onChange={(event) => setEmployeeActive(event.target.checked)} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Funcionario ativo</p>
                      <p className="text-xs text-gray-400">Libera ou bloqueia o app.</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <input type="checkbox" checked={nfcActive} onChange={(event) => setNfcActive(event.target.checked)} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Tag NFC ativa</p>
                      <p className="text-xs text-gray-400">Libera ou bloqueia o crachá.</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tipos liberados</label>
                  <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 md:grid-cols-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleSelection(category.id, selectedCategoryIds, setSelectedCategoryIds)}
                        className={`rounded-xl border px-4 py-4 text-left text-sm transition-colors ${
                          selectedCategoryIds.includes(category.id)
                            ? "border-[#bf0f0c] bg-[#FF201A] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-semibold">{category.prefix}</p>
                        <p className={`mt-1 text-xs ${selectedCategoryIds.includes(category.id) ? "text-white/85" : "text-gray-500"}`}>
                          {category.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <CalendarClock size={14} /> Validade
                    </span>
                    <input
                      type="date"
                      value={appAccessUntil}
                      onChange={(event) => setAppAccessUntil(event.target.value)}
                      className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <input type="checkbox" checked={appAccessEnabled} onChange={(event) => setAppAccessEnabled(event.target.checked)} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Tipos ativos</p>
                      <p className="text-xs text-gray-400">Mantem ou bloqueia os tipos selecionados.</p>
                    </div>
                  </label>
                </div>

                {syncAppAccessMutation.isError && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    Não foi possível salvar o acesso ao aplicativo.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUserForApp(null)}
                  className="operator-action h-12 rounded-xl border border-gray-200 px-5 text-base font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => syncAppAccessMutation.mutate()}
                  className="operator-action h-12 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white hover:bg-[#e01a14]"
                >
                  {syncAppAccessMutation.isPending ? "Salvando..." : "Salvar acesso"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
