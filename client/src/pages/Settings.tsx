import { motion } from "framer-motion";
import { Settings as SettingsIcon, Tag, Building, Bell, Shield, Database, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { mockTags, mockCorrespondents } from "@/mock/data";

const sections = [
  { id: "geral", label: "Geral", icon: SettingsIcon },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "correspondentes", label: "Correspondentes", icon: Building },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "armazenamento", label: "Armazenamento", icon: Database },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState("geral");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(mockTags);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  return (
    <div className="flex gap-5">
      <aside className="w-52 flex-shrink-0">
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  data-testid={`settings-nav-${id}`}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activeSection === id
                      ? "bg-[#FF201A]/10 font-medium text-[#FF201A]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
        className="flex-1"
      >
        {activeSection === "geral" && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Nome da Organização</Label>
                <Input defaultValue="TSEA Energia" className="h-9 text-sm" data-testid="input-org-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Sistema de Gerenciamento</Label>
                <Input defaultValue="TSEA GED" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Idioma</Label>
                <Input defaultValue="Português (Brasil)" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Fuso Horário</Label>
                <Input defaultValue="America/São_Paulo (UTC-3)" className="h-9 text-sm" />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="gap-2 bg-[#FF201A] text-sm text-white hover:bg-[#e01a14]" size="sm" data-testid="button-save-settings">
                  <Save size={13} /> Salvar Alterações
                </Button>
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
                <Input
                  placeholder="Nova tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className="h-9 text-sm"
                  data-testid="input-new-tag"
                />
                <Button onClick={handleAddTag} className="bg-[#FF201A] text-white hover:bg-[#e01a14]" size="sm" data-testid="button-add-tag">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="group flex cursor-pointer items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <span className="text-gray-300 group-hover:text-red-400">×</span>
                  </Badge>
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
            <CardContent className="p-5">
              <div className="space-y-2">
                {mockCorrespondents.map((c) => (
                  <div key={c} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Building size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{c}</span>
                    </div>
                    <button className="text-xs text-gray-400 hover:text-red-500">Remover</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(activeSection === "notificacoes" || activeSection === "seguranca" || activeSection === "armazenamento") && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-gray-300">
              <SettingsIcon size={40} strokeWidth={1} />
              <p className="mt-3 text-sm">Em breve</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
