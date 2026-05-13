import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Tag, Building, Bell, Shield, Database, Save, FileText, FolderOpen, Plus, Trash2 } from "lucide-react";
import { mockTags, mockCorrespondents, mockDocumentTypes, mockStoragePaths } from "@/mock/data";

const sections = [
  { id: "geral",           label: "Geral",               icon: SettingsIcon },
  { id: "tipos",           label: "Tipos de Documento",  icon: FileText },
  { id: "correspondentes", label: "Correspondentes",      icon: Building },
  { id: "caminhos",        label: "Caminhos",            icon: FolderOpen },
  { id: "tags",            label: "Etiquetas",           icon: Tag },
  { id: "seguranca",       label: "Segurança",           icon: Shield },
  { id: "notificacoes",    label: "Notificações",        icon: Bell },
  { id: "armazenamento",   label: "Armazenamento",       icon: Database },
];

function FieldRow({ label, defaultValue, type = "text", testId }: { label: string; defaultValue: string; type?: string; testId?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input defaultValue={defaultValue} type={type} data-testid={testId}
        className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]" />
    </div>
  );
}

export function Settings() {
  const [activeSection, setActiveSection] = useState("geral");
  const [tags, setTags] = useState(mockTags);
  const [newTag, setNewTag] = useState("");
  const [types, setTypes] = useState(mockDocumentTypes.map((t) => t.name));
  const [newType, setNewType] = useState("");
  const [correspondents, setCorrespondents] = useState(mockCorrespondents.map((c) => c.name));
  const [newCorr, setNewCorr] = useState("");
  const [paths, setPaths] = useState(mockStoragePaths.map((p) => p.path));
  const [newPath, setNewPath] = useState("");

  const addItem = (items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>, value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim() && !items.includes(value.trim())) { setItems((p) => [...p, value.trim()]); setValue(""); }
  };
  const removeItem = (items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>, i: number) => setItems(items.filter((_, idx) => idx !== i));

  const activeLabel = sections.find((s) => s.id === activeSection)?.label ?? "";

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:gap-5">
      {/* Mobile: select dropdown */}
      <div className="md:hidden">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-[#FF201A]"
        >
          {sections.map(({ id, label }) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>

      {/* Desktop: sidebar nav */}
      <aside className="hidden md:block w-52 flex-shrink-0">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-2">
          <nav className="space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)} data-testid={`settings-nav-${id}`}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  activeSection === id ? "bg-[#FF201A]/10 font-semibold text-[#FF201A]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <motion.div key={activeSection} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="flex-1 min-w-0">
        {activeSection === "geral" && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-sm font-semibold text-gray-700">Configurações Gerais</h2></div>
            <div className="space-y-4 p-4 md:p-5">
              <FieldRow label="Nome da Organização" defaultValue="TSEA Energia" testId="input-org-name" />
              <FieldRow label="Nome do Sistema" defaultValue="DocStation — TSEA GED" />
              <FieldRow label="Idioma" defaultValue="Português (Brasil)" />
              <FieldRow label="Fuso Horário" defaultValue="America/Sao_Paulo (UTC-3)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow label="Limite de Upload (MB)" defaultValue="50" type="number" />
                <FieldRow label="Expiração de Sessão (horas)" defaultValue="8" type="number" />
              </div>
              <div className="flex justify-end pt-2">
                <button className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]" data-testid="button-save-settings">
                  <Save size={13} /> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "tipos" && (
          <ListEditor title="Tipos de Documento" icon={<FileText size={14} className="text-gray-400" />}
            items={types} newValue={newType} setNewValue={setNewType}
            onAdd={() => addItem(types, setTypes, newType, setNewType)}
            onRemove={(i) => removeItem(types, setTypes, i)}
            placeholder="Ex: Relatório de Inspeção" testId="input-new-type" />
        )}

        {activeSection === "correspondentes" && (
          <ListEditor title="Correspondentes" icon={<Building size={14} className="text-gray-400" />}
            items={correspondents} newValue={newCorr} setNewValue={setNewCorr}
            onAdd={() => addItem(correspondents, setCorrespondents, newCorr, setNewCorr)}
            onRemove={(i) => removeItem(correspondents, setCorrespondents, i)}
            placeholder="Ex: Fornecedor XYZ" testId="input-new-correspondent" />
        )}

        {activeSection === "caminhos" && (
          <ListEditor title="Caminhos de Armazenamento" icon={<FolderOpen size={14} className="text-gray-400" />}
            items={paths} newValue={newPath} setNewValue={setNewPath}
            onAdd={() => addItem(paths, setPaths, newPath, setNewPath)}
            onRemove={(i) => removeItem(paths, setPaths, i)}
            placeholder="Ex: producao/motores/lote-c" mono testId="input-new-path" />
        )}

        {activeSection === "tags" && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-sm font-semibold text-gray-700">Gerenciar Etiquetas</h2></div>
            <div className="space-y-4 p-4 md:p-5">
              <div className="flex gap-2">
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Nova etiqueta..."
                  onKeyDown={(e) => { if (e.key === "Enter") addItem(tags, setTags, newTag, setNewTag); }}
                  className="flex-1 h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" data-testid="input-new-tag" />
                <button onClick={() => addItem(tags, setTags, newTag, setNewTag)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF201A] text-white hover:bg-[#e01a14] transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <button key={tag} onClick={() => removeItem(tags, setTags, i)}
                    className="group flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                    {tag} <span className="text-gray-300 group-hover:text-red-400">×</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeSection === "seguranca" || activeSection === "notificacoes" || activeSection === "armazenamento") && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <SettingsIcon size={40} strokeWidth={1} />
              <p className="mt-3 text-sm font-medium text-gray-400">Em desenvolvimento</p>
              <p className="mt-1 text-xs text-gray-300">Esta seção estará disponível em breve.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ListEditor({ title, icon, items, newValue, setNewValue, onAdd, onRemove, placeholder, mono, testId }: {
  title: string; icon: React.ReactNode; items: string[]; newValue: string;
  setNewValue: (v: string) => void; onAdd: () => void; onRemove: (i: number) => void;
  placeholder?: string; mono?: boolean; testId?: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">{icon}<h2 className="text-sm font-semibold text-gray-700">{title}</h2></div>
      <div className="space-y-3 p-4 md:p-5">
        <div className="flex gap-2">
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") onAdd(); }}
            className={`flex-1 h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A] ${mono ? "font-mono" : ""}`} data-testid={testId} />
          <button onClick={onAdd} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF201A] text-white hover:bg-[#e01a14] transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 md:px-4 py-2.5">
              <span className={`text-sm text-gray-700 truncate mr-2 ${mono ? "font-mono text-xs" : ""}`}>{item}</span>
              <button onClick={() => onRemove(i)} className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
