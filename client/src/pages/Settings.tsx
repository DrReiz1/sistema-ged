import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Database, FileText, Plus, Save, Settings as SettingsIcon, Shield, Tag } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiCategory, type ApiTag } from "@/lib/docstation";

const sections = [
  { id: "geral", label: "Geral", icon: SettingsIcon },
  { id: "tipos", label: "Categorias", icon: FileText },
  { id: "tags", label: "Etiquetas", icon: Tag },
  { id: "seguranca", label: "Seguranca", icon: Shield },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "armazenamento", label: "Armazenamento", icon: Database },
];

function FieldRow({ label, defaultValue, type = "text", testId }: { label: string; defaultValue: string; type?: string; testId?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        defaultValue={defaultValue}
        type={type}
        data-testid={testId}
        className="operator-action h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-700 focus:border-[#FF201A] focus:outline-none"
      />
    </div>
  );
}

export function Settings() {
  const [activeSection, setActiveSection] = useState("geral");
  const [newTag, setNewTag] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePrefix, setNewTypePrefix] = useState("");
  const [importSummary, setImportSummary] = useState<null | { configured: boolean; employees: number; nfcTags: number; documents: number; permissions: number }>(null);

  const { data: tags = [] } = useQuery<ApiTag[]>({
    queryKey: ["/api/tags"],
    queryFn: () => fetchJson<ApiTag[]>("/api/tags"),
  });

  const { data: types = [] } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
    queryFn: () => fetchJson<ApiCategory[]>("/api/categories"),
  });

  const createTagMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tags", {
      name: newTag.trim(),
      color: "#3B82F6",
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      setNewTag("");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/categories", {
      name: newTypeName.trim(),
      prefix: newTypePrefix.trim().toUpperCase(),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      setNewTypeName("");
      setNewTypePrefix("");
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logs", {
      action: "alteracao",
      documentId: null,
      revisionId: null,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
    },
  });

  const importAppSourceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/app/source/import");
      return response.json() as Promise<{ configured: boolean; employees: number; nfcTags: number; documents: number; permissions: number }>;
    },
    onSuccess: (result) => {
      setImportSummary(result);
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 md:flex md:gap-6 md:space-y-0">
      <aside className="md:w-64 md:flex-shrink-0">
        <div className="operator-card rounded-[18px] border border-gray-200 p-3">
          <div className="mb-3 px-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Configurações</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Ajustes</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                data-testid={`settings-nav-${id}`}
                className={`operator-action flex min-h-[56px] items-center gap-3 rounded-xl px-4 text-left text-sm transition-colors ${
                  activeSection === id ? "bg-[#FF201A]/10 font-semibold text-[#FF201A]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <motion.div key={activeSection} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="min-w-0 flex-1">
        {activeSection === "geral" && (
          <div className="operator-card rounded-[18px] border border-gray-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Geral</h2>
              <p className="mt-1 text-sm text-gray-500">Ajustes basicos de funcionamento.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldRow label="Idioma" defaultValue="Portugues (Brasil)" />
              <FieldRow label="Fuso horario" defaultValue="America/Sao_Paulo (UTC-3)" />
              <FieldRow label="Limite de upload (MB)" defaultValue="100" type="number" />
              <FieldRow label="Expiracao de sessao (horas)" defaultValue="8" type="number" />
            </div>

            <div className="rounded-[16px] border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-800">Importar base do app</p>
                  <p className="mt-1 text-sm text-gray-500">Le o Supabase do app e espelha os dados no banco do GED.</p>
                </div>
                <button
                  onClick={() => importAppSourceMutation.mutate()}
                  className="operator-action h-12 rounded-xl border border-blue-200 bg-blue-50 px-5 text-base font-semibold text-blue-700 hover:bg-blue-100"
                  type="button"
                >
                  {importAppSourceMutation.isPending ? "Importando..." : "Importar agora"}
                </button>
              </div>
              {importSummary && (importSummary.configured ? (
                <p className="mt-3 text-sm text-gray-600">
                  Importados: {importSummary.employees} funcionários, {importSummary.nfcTags} tags NFC, {importSummary.documents} documentos e {importSummary.permissions} permissões.
                </p>
              ) : (
                <p className="mt-3 text-sm text-amber-700">
                  A origem externa do app ainda nÃ£o foi configurada no ambiente atual.
                </p>
              ))}
              {importAppSourceMutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                  Não foi possível importar a base do app. Verifique as credenciais de leitura da origem.
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => saveSettingsMutation.mutate()}
                className="operator-action flex h-12 items-center gap-2 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white hover:bg-[#e01a14]"
                data-testid="button-save-settings"
              >
                <Save size={16} /> Salvar
              </button>
            </div>
          </div>
        )}

        {activeSection === "tipos" && (
          <div className="operator-card rounded-[18px] border border-gray-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Categorias</h2>
              <p className="mt-1 text-sm text-gray-500">Cadastre novos tipos de documentos.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_160px_auto]">
              <input
                value={newTypeName}
                onChange={(event) => setNewTypeName(event.target.value)}
                placeholder="Nome da categoria"
                className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
              />
              <input
                value={newTypePrefix}
                onChange={(event) => setNewTypePrefix(event.target.value)}
                placeholder="SIG"
                className="operator-action h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base uppercase focus:border-[#FF201A] focus:outline-none"
              />
              <button onClick={() => createCategoryMutation.mutate()} className="operator-action flex h-12 items-center justify-center rounded-xl bg-[#FF201A] px-5 text-white hover:bg-[#e01a14]">
                <Plus size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {types.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
                  <p className="text-base font-semibold text-gray-800">{item.name}</p>
                  <p className="mt-1 text-sm font-mono text-[#FF201A]">{item.prefix}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "tags" && (
          <div className="operator-card rounded-[18px] border border-gray-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Etiquetas</h2>
              <p className="mt-1 text-sm text-gray-500">Cadastre marcações para organizar documentos.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="Nova etiqueta"
                onKeyDown={(event) => { if (event.key === "Enter") createTagMutation.mutate(); }}
                className="operator-action h-12 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
                data-testid="input-new-tag"
              />
              <button onClick={() => createTagMutation.mutate()} className="operator-action flex h-12 items-center justify-center rounded-xl bg-[#FF201A] px-5 text-white hover:bg-[#e01a14]">
                <Plus size={18} />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag.id} className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-700">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {(activeSection === "seguranca" || activeSection === "notificacoes" || activeSection === "armazenamento") && (
          <div className="operator-card rounded-[18px] border border-gray-200 py-24 text-center">
            <SettingsIcon size={48} strokeWidth={1} className="mx-auto text-gray-200" />
            <p className="mt-4 text-base font-medium text-gray-500">Seção em desenvolvimento</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
