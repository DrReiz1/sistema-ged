import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Grid, Save, Check, ChevronLeft } from "lucide-react";

export function Customize() {
  const [density, setDensity] = useState("normal");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Aparência</h1>
        <p className="text-sm text-gray-400 mt-1">Ajuste o comportamento da interface</p>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <Check size={16} className="text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-700">Preferências salvas com sucesso!</p>
        </motion.div>
      )}

      {/* Density */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Grid size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Espaçamento da Interface</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { id: "compact",  label: "Compacto",  desc: "Mais itens visíveis na tela ao mesmo tempo" },
            { id: "normal",   label: "Normal",    desc: "Equilíbrio entre espaço e conteúdo" },
            { id: "relaxed",  label: "Espaçado",  desc: "Maior espaçamento — ideal para telas touch" },
          ].map((d) => (
            <button key={d.id} onClick={() => setDensity(d.id)} data-testid={`density-${d.id}`}
              className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                density === d.id ? "border-[#FF201A] bg-[#FF201A]/5 ring-1 ring-[#FF201A]/20" : "border-gray-200 hover:border-gray-300"
              }`}>
              <div className={`h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center ${density === d.id ? "bg-[#FF201A] text-white" : "bg-gray-100 text-gray-400"}`}>
                {d.id === "compact" ? "≡" : d.id === "normal" ? "☰" : "≣"}
              </div>
              <div>
                <p className={`text-sm font-semibold ${density === d.id ? "text-[#FF201A]" : "text-gray-700"}`}>{d.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.desc}</p>
              </div>
              {density === d.id && <Check size={16} className="ml-auto text-[#FF201A]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Settings size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Menu Lateral</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Iniciar recolhido</p>
              <p className="text-xs text-gray-400 mt-0.5">Exibe apenas os ícones ao abrir o sistema</p>
            </div>
            <button onClick={() => setSidebarCollapsed((v) => !v)} data-testid="toggle-sidebar-default"
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${sidebarCollapsed ? "bg-[#FF201A]" : "bg-gray-200"}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${sidebarCollapsed ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 flex items-start gap-3">
        <ChevronLeft size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-700">Identidade visual TSEA</p>
          <p className="text-xs text-gray-400 mt-1">
            As cores e o tema do sistema seguem o padrão visual da TSEA Energia e não podem ser alterados.
            Isso garante consistência e identidade corporativa em todos os terminais.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-[#FF201A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
          data-testid="button-save-customize">
          <Save size={15} /> Salvar Preferências
        </button>
      </div>
    </div>
  );
}
