import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Grid, Save, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function Customize() {
  const [density, setDensity] = useState("normal");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [saved, setSaved] = useState(false);

  const saveCustomizeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logs", {
      action: "preferencias_interface",
      documentId: null,
      revisionId: null,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
    },
  });

  const handleSave = () => {
    saveCustomizeMutation.mutate();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="operator-surface rounded-[18px] border border-white/70 p-5 md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Aparência</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Aparência</h1>
          <p className="mt-2 text-sm text-gray-500">Escolha como a interface deve abrir no dia a dia.</p>
        </div>
      </section>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <Check size={18} className="text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">Preferencias salvas com sucesso.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="operator-card rounded-[18px] border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#FF201A]">
              <Grid size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Espacamento</h2>
              <p className="text-sm text-gray-500">Escolha a densidade da tela.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { id: "compact", label: "Compacto", desc: "Mostra mais itens na tela." },
              { id: "normal", label: "Normal", desc: "Equilibrio entre espaco e leitura." },
              { id: "relaxed", label: "Espacado", desc: "Mais confortavel para telas touch." },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setDensity(option.id)}
                data-testid={`density-${option.id}`}
                className={`operator-action flex min-h-[76px] w-full items-center gap-4 rounded-[16px] border p-4 text-left transition-all ${
                  density === option.id ? "border-[#FF201A] bg-[#FF201A]/5 ring-1 ring-[#FF201A]/20" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${density === option.id ? "bg-[#FF201A] text-white" : "bg-gray-100 text-gray-400"}`}>
                  {option.id === "compact" ? "=" : option.id === "normal" ? "~" : "+"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-base font-semibold ${density === option.id ? "text-[#FF201A]" : "text-gray-700"}`}>{option.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{option.desc}</p>
                </div>
                {density === option.id && <Check size={18} className="text-[#FF201A]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="operator-card rounded-[18px] border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <Settings size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Menu lateral</h2>
                <p className="text-sm text-gray-500">Defina como o menu deve abrir.</p>
              </div>
            </div>

            <div className="mt-5 rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-gray-700">Iniciar recolhido</p>
                  <p className="mt-1 text-sm text-gray-500">Exibe apenas os icones ao abrir o sistema.</p>
                </div>
                <button
                  onClick={() => setSidebarCollapsed((value) => !value)}
                  data-testid="toggle-sidebar-default"
                  className={`relative inline-flex h-8 w-14 items-center rounded-lg transition-colors ${sidebarCollapsed ? "bg-[#FF201A]" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${sidebarCollapsed ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm font-semibold text-gray-700">Identidade visual</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              O sistema continua usando o padrao visual da TSEA para manter consistencia em todos os terminais.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="operator-action flex h-12 items-center gap-2 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-6 text-base font-semibold text-white hover:bg-[#e01a14]"
          data-testid="button-save-customize"
        >
          <Save size={16} /> Salvar preferencias
        </button>
      </div>
    </div>
  );
}
