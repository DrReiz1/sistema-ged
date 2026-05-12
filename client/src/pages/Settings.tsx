import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Tag, Building, Bell, Shield, Database, Save, FileText, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockTags, mockCorrespondents, mockDocumentTypes, mockStoragePaths } from "@/mock/data";

const sections = [
  { id: "geral",          label: "Geral",                icon: SettingsIcon },
  { id: "tipos",          label: "Tipos de Documento",   icon: FileText },
  { id: "correspondentes",label: "Correspondentes",       icon: Building },
  { id: "caminhos",       label: "Caminhos",             icon: FolderOpen },
  { id: "tags",           label: "Tags",                 icon: Tag },
  { id: "seguranca",      label: "Segurança",            icon: Shield },
  { id: "notificacoes",   label: "Notificações",         icon: Bell },
  { id: "armazenamento",  label: "Armazenamento",        icon: Database },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState("geral");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(mockTags);
  const [newType, setNewType] = useState("");
  const [types, setTypes] = useState(mockDocumentTypes.map((t) => t.name));
  const [newCorr, setNewCorr] = useState("");
  const [correspondents, setCorrespondents] = useState(mockCorrespondents.map((c) => c.name));
  const [newPath, setNewPath] = useState("");
  const [paths, setPaths] = useState(mockStoragePaths.map((p) => p.path));

  return (
    <div className="flex gap-5">
      {/* Sidebar nav */}
      <aside className="w-56 flex-shrink-0">
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {sections.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveSection(id)} data-testid={`settings-nav-${id}`}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activeSection === id ? "bg-[#FF201A]/10 font-medium text-[#FF201A]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Content */}
      <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="flex-1">
        {activeSection === "geral" && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <FieldRow label="Nome da Organização" defaultValue="TSEA Energia" testId="input-org-name" />
              <FieldRow label="Nome do Sistema" defaultValue="DocStation — TSEA GED" />
              <FieldRow label="Idioma" defaultValue="Português (Brasil)" />
              <FieldRow label="Fuso Horário" defaultValue="America/Sao_Paulo (UTC-3)" />
              <FieldRow label="Limite de Upload (MB)" defaultValue="50" type="number" />
              <FieldRow label="Expiração de Sessão (horas)" defaultValue="8" type="number" />
              <div className="flex justify-end pt-2">
                <Button className="gap-2 bg-[#FF201A] text-sm text-white hover:bg-[#e01a14]" size="sm" data-testid="button-save-settings">
                  <Save size={13} /> Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "tipos" && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Tipos de Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-2">
                <Input placeholder="Novo tipo de documento..." value={newType} onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newType.trim()) { setTypes((p) => [...p, newType.trim()]); setNewType(""); } }}
                  className="h-9 text-sm" data-testid="input-new-type" />
                <Button onClick={() => { if (newType.trim()) { setTypes((p) => [...p, newType.trim()]); setNewType(""); } }}
                  className="bg-[#FF201A] text-white hover:bg-[#e01a14]" size="sm">
                  <Plus size={14} />
                </Button>
              </div>
              <div className="space-y-2">
                {types.map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{t}</span>
                    </div>
                    <button onClick={() => setTypes((p) => p.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "correspondentes" && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Correspondentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-2">
                <Input placeholder="Novo correspondente..." value={newCorr} onChange={(e) => setNewCorr(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newCorr.trim()) { setCorrespondents((p) => [...p, newCorr.trim()]); setNewCorr(""); } }}
                  className="h-9 text-sm" data-testid="input-new-correspondent" />
                <Button onClick={() => { if (newCorr.trim()) { setCorrespondents((p) => [...p, newCorr.trim()]); setNewCorr(""); } }}
                  className="bg-[#FF201A] text-white hover:bg-[#e01a14]" size="sm">
                  <Plus size={14} />
                </Button>
              </div>
              <div className="space-y-2">
                {correspondents.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Building size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{c}</span>
                    </div>
                    <button onClick={() => setCorrespondents((p) => p.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "caminhos" && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Caminhos de Armazenamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-2">
                <Input placeholder="Ex: producao/motores/lote-c" value={newPath} onChange={(e) => setNewPath(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newPath.trim()) { setPaths((p) => [...p, newPath.trim()]); setNewPath(""); } }}
                  className="h-9 font-mono text-sm" data-testid="input-new-path" />
                <Button onClick={() => { if (newPath.trim()) { setPaths((p) => [...p, newPath.trim()]); setNewPath(""); } }}
                  className="bg-[#FF201A] text-white hover:bg-[#e01a14]" size="sm">
                  <Plus size={14} />
                </Button>
              </div>
              <div className="space-y-2">
                {paths.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={13} className="text-gray-400" />
                      <span className="font-mono text-sm text-gray-700">{p}</span>
                    </div>
                    <button onClick={() => setPaths((prev) => prev.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "tags" && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Gerenciar Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-2">
                <Input placeholder="Nova tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newTag.trim() && !tags.includes(newTag.trim())) { setTags((p) => [...p, newTag.trim()]); setNewTag(""); } }}
                  className="h-9 text-sm" data-testid="input-new-tag" />
                <Button onClick={() => { if (newTag.trim() && !tags.includes(newTag.trim())) { setTags((p) => [...p, newTag.trim()]); setNewTag(""); } }}
                  className="bg-[#FF201A] text-white hover:bg-[#e01a14]" size="sm">
                  <Plus size={14} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag} onClick={() => setTags((p) => p.filter((t) => t !== tag))}
                    className="group flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-red-50 hover:text-red-600">
                    {tag} <span className="text-gray-300 group-hover:text-red-400">×</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(activeSection === "seguranca" || activeSection === "notificacoes" || activeSection === "armazenamento") && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-gray-300">
              <SettingsIcon size={40} strokeWidth={1} />
              <p className="mt-3 text-sm font-medium text-gray-400">Em desenvolvimento</p>
              <p className="mt-1 text-xs text-gray-300">Esta seção estará disponível em breve.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

function FieldRow({ label, defaultValue, testId, type = "text" }: { label: string; defaultValue: string; testId?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-gray-600">{label}</Label>
      <Input defaultValue={defaultValue} type={type} className="h-9 text-sm" data-testid={testId} />
    </div>
  );
}
