import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Tag, FileText, X } from "lucide-react";
import { mockTagObjects, type Tag as TagType, mockDocuments } from "@/mock/data";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#6B7280", "#374151",
];

export function Tags() {
  const [tags, setTags] = useState<TagType[]>(mockTagObjects);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newDesc, setNewDesc] = useState("");
  const [nextId, setNextId] = useState(mockTagObjects.length + 1);

  const docCount = (tagName: string) => mockDocuments.filter((d) => d.tags.includes(tagName)).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || tags.some((t) => t.name === name)) return;
    setTags((p) => [...p, { id: nextId, name, color: newColor, description: newDesc.trim() || undefined }]);
    setNextId((n) => n + 1);
    setNewName(""); setNewColor("#3B82F6"); setNewDesc("");
    setShowForm(false);
  };

  const filtered = tags.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Etiquetas</h1>
          <p className="text-sm text-gray-400 mt-1">Categorize documentos para facilitar a busca</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          data-testid="button-add-tag"
          className="flex items-center gap-2 rounded-xl bg-[#FF201A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]">
          <Plus size={16} /> Adicionar Etiqueta
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Nova Etiqueta</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Nome <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} required
                    placeholder="Ex: Alta Tensão, NR-10, Preventiva..."
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#FF201A]"
                    data-testid="input-new-tag" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setNewColor(c)}
                      className={`h-9 w-9 rounded-lg transition-all ${newColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`}
                      style={{ background: c }} />
                  ))}
                </div>
                {newName && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">Prévia:</span>
                    <span className="rounded-lg px-3 py-1 text-xs font-semibold text-white" style={{ background: newColor }}>{newName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Descrição <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Descrição breve desta etiqueta..."
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#FF201A]"
                  data-testid="input-tag-description" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#FF201A] text-white text-sm font-semibold hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]">
                  Salvar Etiqueta
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtrar etiquetas..."
        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:border-[#FF201A]" />

      <p className="text-xs text-gray-400">{filtered.length} etiqueta(s)</p>

      {/* Tag grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((tag, i) => {
          const count = docCount(tag.name);
          return (
            <motion.div key={tag.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              data-testid={`card-tag-${tag.name}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: tag.color }}>
                  {tag.name}
                </span>
                <button onClick={() => setTags((p) => p.filter((t) => t.id !== tag.id))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
              {tag.description && (
                <p className="text-[11px] text-gray-400 leading-tight mb-2 flex-1">{tag.description}</p>
              )}
              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-100">
                <FileText size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500"><strong className="text-gray-700">{count}</strong> documento(s)</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Tag size={40} strokeWidth={1} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Nenhuma etiqueta encontrada.</p>
        </div>
      )}
    </div>
  );
}
