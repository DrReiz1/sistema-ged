import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CheckCircle, Layers3, Search, Shield, Smartphone, UserPlus, X, XCircle } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiCategory, type ApiGroup, type ApiUser, formatDate } from "@/lib/docstation";

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

  const syncAppAccessMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserForApp) {
        throw new Error("Nenhum funcionário selecionado.");
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Grupos operacionais e integração do app</h1>
          <p className="mt-1 text-sm text-gray-400">
            O GED continua organizando os documentos por grupo, mas o aplicativo recebe permissões por funcionário, NFC e tipo de documento liberado.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e01a14]"
          onClick={() => setShowUserForm((value) => !value)}
        >
          <UserPlus size={14} /> Novo usuário
        </button>
      </div>

      <AnimatePresence>
        {showUserForm && (
          <motion.form
            onSubmit={handleUserSubmit}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Novo usuário operacional</h2>
              <button type="button" onClick={() => setShowUserForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nome completo" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none" />
              <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="E-mail" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none" />
              <input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Senha inicial" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none" />
              <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none">
                <option value="operator">Operador</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
              <input value={form.operatorId} onChange={(event) => setForm((prev) => ({ ...prev, operatorId: event.target.value }))} placeholder="ID do operador" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none" />
              <input value={form.rfidTag} onChange={(event) => setForm((prev) => ({ ...prev, rfidTag: event.target.value }))} placeholder="Código NFC / RFID inicial" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none" />
              <input value={form.sector} onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))} placeholder="Área técnica (ex.: Transformadores)" className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none md:col-span-2" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Grupos liberados dentro do GED</label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleSelection(group.id, selectedGroupIds, setSelectedGroupIds)}
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
                Esses grupos controlam a navegação do GED. O aplicativo será configurado por tipo de documento.
              </p>
            </div>

            {createUserMutation.isError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Não foi possível salvar o usuário.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowUserForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e01a14]">
                {createUserMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <Smartphone size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Integração mínima com o Dockstation</p>
            <p className="mt-1 text-blue-800">
              O app valida o crachá NFC, recebe apenas nome e ID do operador, e depois consulta no Supabase todos os documentos dos tipos liberados para esse funcionário.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {availableGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedGroup === group ? "border border-[#bf0f0c] bg-[#FF201A] text-white" : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-gray-300"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Pesquisar usuários..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 shadow-sm focus:border-[#FF201A] focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {["Usuário", "ID do operador", "Grupos GED", "Acesso no app", "NFC", "Status", ""].map((header) => (
                <th key={header} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="border-b border-gray-50 transition-colors hover:bg-gray-50/60"
              >
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
                <td className="px-5 py-3 text-sm font-semibold text-gray-700">{user.operatorId}</td>
                <td className="px-5 py-3 text-sm text-gray-600">
                  {user.groups.length > 0 ? user.groups.map((group) => group.name).join(", ") : "Sem grupo"}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Layers3 size={14} className="text-blue-500" />
                    <span>{accessSummary(user)}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {user.appProfile.nfcCode ? (user.appProfile.nfcActive ? "Ativo" : "Inativo") : "Não cadastrado"}
                </td>
                <td className="px-5 py-3">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleBadge[user.role]}`}>
                      <Shield size={10} /> {roleLabel[user.role]}
                    </span>
                    <div>
                      {user.appProfile.employeeActive
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600"><CheckCircle size={12} /> Liberado no app</span>
                        : <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400"><XCircle size={12} /> Bloqueado no app</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openAppAccessModal(user)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Configurar app
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
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
              className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Acesso ao aplicativo</h2>
                  <p className="text-sm text-gray-400">{selectedUserForApp.name} · {selectedUserForApp.operatorId}</p>
                </div>
                <button type="button" onClick={() => setSelectedUserForApp(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dados públicos no app</p>
                    <p className="mt-2 text-sm font-medium text-gray-700">Nome: {selectedUserForApp.name}</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">ID do operador: {selectedUserForApp.operatorId}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Dado privado</p>
                    <p className="mt-2 text-sm font-medium text-amber-800">
                      O código NFC é usado apenas para autenticação. O app não deve exibir esse valor para o operador.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Código NFC</span>
                    <input
                      value={nfcCode}
                      onChange={(event) => setNfcCode(event.target.value)}
                      placeholder="Ex.: TESTE_EMULADOR_001"
                      className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <input type="checkbox" checked={employeeActive} onChange={(event) => setEmployeeActive(event.target.checked)} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Funcionário ativo no app</p>
                      <p className="text-xs text-gray-400">Se desmarcado, o crachá será recusado.</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <input type="checkbox" checked={nfcActive} onChange={(event) => setNfcActive(event.target.checked)} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Tag NFC ativa</p>
                      <p className="text-xs text-gray-400">Permite ou bloqueia o uso desse crachá no app.</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tipos de documento liberados no aplicativo</label>
                  <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 md:grid-cols-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleSelection(category.id, selectedCategoryIds, setSelectedCategoryIds)}
                        className={`rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
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
                  <p className="text-xs text-gray-400">
                    O app vai liberar automaticamente todos os documentos cadastrados nesses tipos para esse funcionário.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <CalendarClock size={14} /> Validade da permissão
                    </span>
                    <input
                      type="date"
                      value={appAccessUntil}
                      onChange={(event) => setAppAccessUntil(event.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <input type="checkbox" checked={appAccessEnabled} onChange={(event) => setAppAccessEnabled(event.target.checked)} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Permissões de tipos ativas</p>
                      <p className="text-xs text-gray-400">Se desmarcado, os vínculos continuam no histórico, mas ficam inativos.</p>
                    </div>
                  </label>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-700">Fluxo do app</p>
                  <p className="mt-1">
                    O app valida a tag NFC, recebe apenas o nome e o ID do operador, e depois consulta todos os documentos dos tipos permitidos para esse funcionário no Supabase.
                  </p>
                </div>

                {syncAppAccessMutation.isError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    Não foi possível salvar o acesso ao aplicativo.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedUserForApp(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => syncAppAccessMutation.mutate()}
                  className="rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e01a14]"
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
