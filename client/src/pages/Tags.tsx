import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Plus, Search, Tag, X } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiDocument, type ApiTag } from "@/lib/docstation";

const PRESET_COLORS = [
  "#B91C1C", "#C2410C", "#B45309", "#15803D",
  "#0F766E", "#1D4ED8", "#6D28D9", "#BE185D",
  "#4B5563", "#111827",
];

export function Tags() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#1D4ED8");
  const [newDescription, setNewDescription] = useState("");

  const { data: tags = [] } = useQuery<ApiTag[]>({
    queryKey: ["/api/tags"],
    queryFn: () => fetchJson<ApiTag[]>("/api/tags"),
  });

  const { data: documents = [] } = useQuery<ApiDocument[]>({
    queryKey: ["/api/documents"],
    queryFn: () => fetchJson<ApiDocument[]>("/api/documents"),
  });

  const createTagMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tags", {
      name: newName.trim(),
      color: newColor,
      description: newDescription.trim() || undefined,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      setNewName("");
      setNewColor("#1D4ED8");
      setNewDescription("");
      setShowForm(false);
    },
  });

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) {
      return;
    }

    createTagMutation.mutate();
  };

  const countDocuments = (tagId: string) => documents.filter((document) => document.tags.some((tag) => tag.id === tagId)).length;
  const filteredTags = tags.filter((tag) => {
    if (!search) {
      return true;
    }

    const query = search.toLowerCase();
    return tag.name.toLowerCase().includes(query) || (tag.description ?? "").toLowerCase().includes(query);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="operator-surface rounded-[18px] border border-white/70 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="border-l-4 border-[#FF201A] pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Classificacao documental</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Etiquetas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Padronize marcacoes usadas na identificacao dos documentos e facilite a leitura operacional da base.
            </p>
          </div>
          <button
            onClick={() => setShowForm((value) => !value)}
            data-testid="button-add-tag"
            className="operator-action h-14 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white transition-colors hover:bg-[#e01a14]"
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={18} /> Nova etiqueta
            </span>
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="operator-card rounded-[18px] border border-slate-300 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Cadastrar etiqueta</h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nome da etiqueta</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      required
                      placeholder="Ex.: Alta tensao, NR-10, Manutencao"
                      className="operator-action h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-base focus:border-[#FF201A] focus:outline-none"
                      data-testid="input-new-tag"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Descricao</label>
                  <input
                    value={newDescription}
                    onChange={(event) => setNewDescription(event.target.value)}
                    placeholder="Aplicacao da etiqueta no GED"
                    className="operator-action h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
                    data-testid="input-tag-description"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Cor padrao</label>
                <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`h-11 w-full rounded-lg border transition-all ${newColor === color ? "border-slate-800 ring-2 ring-slate-300" : "border-slate-300 hover:border-slate-500"}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="operator-action h-12 rounded-xl border border-slate-300 px-5 text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="operator-action h-12 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white hover:bg-[#e01a14]"
                >
                  {createTagMutation.isPending ? "Salvando..." : "Salvar etiqueta"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="operator-card rounded-[18px] border border-slate-300 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filtrar etiquetas por nome ou descricao"
              className="operator-action h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-base text-gray-700 focus:border-[#FF201A] focus:outline-none"
            />
          </div>
          <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredTags.length}</span> etiqueta(s)
          </div>
        </div>
      </div>

      {filteredTags.length > 0 ? (
        <div className="space-y-3">
          {filteredTags.map((tag, index) => {
            const count = countDocuments(tag.id);
            return (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="operator-card rounded-[18px] border border-slate-300 p-5"
                data-testid={`card-tag-${tag.name}`}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr_140px] md:items-center">
                  <div className="flex items-center gap-3">
                    <span className="h-12 w-3 rounded-sm" style={{ background: tag.color }} />
                    <div>
                      <p className="text-base font-semibold text-gray-800">{tag.name}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Etiqueta documental</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm leading-6 text-gray-600">
                      {tag.description || "Sem descricao cadastrada para esta etiqueta."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">documento(s)</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="operator-card rounded-[18px] border border-dashed border-slate-300 py-20 text-center">
          <Tag size={40} strokeWidth={1} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-500">Nenhuma etiqueta encontrada.</p>
        </div>
      )}
    </div>
  );
}
