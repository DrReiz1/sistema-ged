import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Sun, Moon, Layout, Grid, List, Save, Check } from "lucide-react";

const THEMES = [
  { id: "tsea-red", label: "TSEA Vermelho", primary: "#FF201A", bg: "#dbd8d3", sidebar: "#FF201A" },
  { id: "tsea-dark", label: "TSEA Escuro", primary: "#FF201A", bg: "#1a1a1e", sidebar: "#111114" },
  { id: "tsea-blue", label: "TSEA Azul", primary: "#1D4ED8", bg: "#dbd8d3", sidebar: "#1D4ED8" },
  { id: "tsea-slate", label: "TSEA Slate", primary: "#475569", bg: "#e8e8e8", sidebar: "#334155" },
];

const DENSITY_OPTIONS = [
  { id: "compact", label: "Compacto", desc: "Mais itens visíveis na tela" },
  { id: "normal", label: "Normal", desc: "Equilíbrio entre espaço e densidade" },
  { id: "relaxed", label: "Espaçado", desc: "Maior espaçamento entre itens" },
];

const DEFAULT_VIEW = [
  { id: "grid", label: "Grade", icon: Grid },
  { id: "list", label: "Lista", icon: List },
];

export function Customize() {
  const [theme, setTheme] = useState("tsea-red");
  const [density, setDensity] = useState("normal");
  const [defaultView, setDefaultView] = useState("grid");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Personalização</h1>
        <p className="mt-1 text-sm text-gray-400">Ajuste a aparência e o comportamento do sistema</p>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Check size={15} className="text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">Preferências salvas com sucesso!</p>
        </motion.div>
      )}

      {/* Tema */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Tema de Cores</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id)} data-testid={`theme-${t.id}`}
              className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${theme === t.id ? "border-[#FF201A] ring-1 ring-[#FF201A]/30" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="flex gap-1.5">
                <div className="h-8 w-5 rounded" style={{ background: t.sidebar }} />
                <div className="h-8 w-8 rounded" style={{ background: t.bg, border: "1px solid #ccc" }}>
                  <div className="h-2 w-full rounded-t" style={{ background: t.primary, opacity: 0.3 }} />
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">{t.label}</p>
                {theme === t.id && <p className="text-[10px] font-semibold text-[#FF201A] mt-0.5">Ativo</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Aparência */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Sun size={14} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Aparência</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Density */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Densidade da Interface</p>
            <div className="flex gap-2">
              {DENSITY_OPTIONS.map((d) => (
                <button key={d.id} onClick={() => setDensity(d.id)} data-testid={`density-${d.id}`}
                  className={`flex-1 rounded-lg border p-3 text-left transition-all ${density === d.id ? "border-[#FF201A] bg-[#FF201A]/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className={`text-sm font-medium ${density === d.id ? "text-[#FF201A]" : "text-gray-700"}`}>{d.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Default view */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Visualização Padrão dos Documentos</p>
            <div className="flex gap-2">
              {DEFAULT_VIEW.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setDefaultView(id)} data-testid={`view-${id}`}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${defaultView === id ? "border-[#FF201A] bg-[#FF201A]/5 text-[#FF201A]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar default */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-700">Sidebar recolhida por padrão</p>
              <p className="text-xs text-gray-400 mt-0.5">Inicia com a barra lateral mostrando apenas ícones</p>
            </div>
            <button onClick={() => setSidebarCollapsed((v) => !v)} data-testid="toggle-sidebar-default"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sidebarCollapsed ? "bg-[#FF201A]" : "bg-gray-200"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${sidebarCollapsed ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
          data-testid="button-save-customize">
          <Save size={13} /> Salvar Preferências
        </button>
      </div>
    </div>
  );
}
