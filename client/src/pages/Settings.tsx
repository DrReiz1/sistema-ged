import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Tag, Bell, Shield, Database, Save, FileText, Plus } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiCategory, type ApiTag } from "@/lib/docstation";

const sections = [
  { id: "geral", label: "Geral", icon: SettingsIcon },
  { id: "tipos", label: "Categorias", icon: FileText },
  { id: "tags", label: "Etiquetas", icon: Tag },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "armazenamento", label: "Armazenamento", icon: Database },
];

function FieldRow({ label, defaultValue, type = "text", testId }: { label: string; defaultValue: string; type?: string; testId?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        defaultValue={defaultValue}
        type={type}
        data-testid={testId}
        className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]"
      />
    </div>
  );
}

export function Settings() {
  const [activeSection, setActiveSection] = useState("geral");
  const [newTag, setNewTag] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePrefix, setNewTypePrefix] = useState("");

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

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:gap-5">
      <div className="md:hidden">
        <select
          value={activeSection}
          onChange={(event) => setActiveSection(event.target.value)}
          className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-[#FF201A]"
        >
          {sections.map(({ id, label }) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>

      <aside className="hidden md:block w-52 flex-shrink-0">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-2">
          <nav className="space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                data-testid={`settings-nav-${id}`}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-sm transition-colors ${
                  activeSection === id ? "bg-[#FF201A]/10 font-semibold text-[#FF201A]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <motion.div key={activeSection} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="flex-1 min-w-0">
        {activeSection === "geral" && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-700">Configurações Gerais</h2>
            </div>
            <div className="space-y-4 p-4 md:p-5">
              <FieldRow label="Nome da Organização" defaultValue="TSEA Energia" testId="input-org-name" />
              <FieldRow label="Nome do Sistema" defaultValue="TSEA GED" />
              <FieldRow label="Idioma" defaultValue="Português (Brasil)" />
              <FieldRow label="Fuso Horário" defaultValue="America/Sao_Paulo (UTC-3)" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow label="Limite de Upload (MB)" defaultValue="100" type="number" />
                <FieldRow label="Expiração de Sessão (horas)" defaultValue="8" type="number" />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => saveSettingsMutation.mutate()}
                  className="flex items-center gap-2 rounded-xl bg-[#FF201A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
                  data-testid="button-save-settings"
                >
                  <Save size={14} /> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "tipos" && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <FileText size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Categorias de Documento</h2>
            </div>
            <div className="space-y-3 p-4 md:p-5">
              <div className="grid grid-cols-[1fr_120px_40px] gap-2">
                <input
                  value={newTypeName}
                  onChange={(event) => setNewTypeName(event.target.value)}
                  placeholder="Ex.: Relatório de Inspeção"
                  className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]"
                />
                <input
                  value={newTypePrefix}
                  onChange={(event) => setNewTypePrefix(event.target.value)}
                  placeholder="REL"
                  className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm uppercase focus:outline-none focus:border-[#FF201A]"
                />
                <button onClick={() => createCategoryMutation.mutate()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF201A] text-white hover:bg-[#e01a14] transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              <div className="space-y-2">
                {types.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3">
                    <span className="text-sm text-gray-700 truncate mr-2">{item.name} <span className="font-mono text-xs text-[#FF201A]">{item.prefix}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "tags" && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-700">Gerenciar Etiquetas</h2>
            </div>
            <div className="space-y-4 p-4 md:p-5">
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  placeholder="Nova etiqueta..."
                  onKeyDown={(event) => { if (event.key === "Enter") createTagMutation.mutate(); }}
                  className="flex-1 h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]"
                  data-testid="input-new-tag"
                />
                <button onClick={() => createTagMutation.mutate()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF201A] text-white hover:bg-[#e01a14] transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag.id} className="group flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeSection === "seguranca" || activeSection === "notificacoes" || activeSection === "armazenamento") && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
              <SettingsIcon size={48} strokeWidth={1} />
              <p className="mt-3 text-sm font-medium text-gray-400">Em desenvolvimento</p>
              <p className="mt-1 text-xs text-gray-300">Esta seção estará disponível em breve.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
