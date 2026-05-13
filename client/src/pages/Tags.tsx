import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Tag, FileText } from "lucide-react";
import { mockTags, mockDocuments } from "@/mock/data";

const TAG_COLORS = [
  "bg-red-100 text-red-700 border-red-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

function tagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function Tags() {
  const [tags, setTags] = useState(mockTags);
  const [newTag, setNewTag] = useState("");
  const [search, setSearch] = useState("");

  const docCount = (tag: string) => mockDocuments.filter((d) => d.tags.includes(tag)).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = newTag.trim();
    if (t && !tags.includes(t)) { setTags((p) => [...p, t]); setNewTag(""); }
  };

  const filtered = tags.filter((t) => !search || t.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Etiquetas</h1>
        <p className="mt-1 text-sm text-gray-400">Categorize documentos com etiquetas para facilitar a pesquisa e filtragem</p>
      </div>

      {/* Add form */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Adicionar Etiqueta</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Ex: Alta Tensão, Segurança, NR-10..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#FF201A]" data-testid="input-new-tag" />
          </div>
          <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-[#FF201A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]" data-testid="button-add-tag">
            <Plus size={14} /> Adicionar
          </button>
        </form>
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtrar etiquetas..."
        className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:border-[#FF201A]" />

      {/* Stats */}
      <p className="text-xs text-gray-400">{filtered.length} etiqueta(s) · {tags.reduce((acc, t) => acc + docCount(t), 0)} vínculos com documentos</p>

      {/* Tag grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((tag, i) => {
          const count = docCount(tag);
          const color = tagColor(tag);
          return (
            <motion.div key={tag} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all" data-testid={`card-tag-${tag}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`flex-shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${color}`}>
                  <Tag size={11} className="inline mr-1 -mt-0.5" />{tag}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <FileText size={11} />
                  <span className="font-semibold text-gray-600">{count}</span>
                </div>
                <button onClick={() => setTags((p) => p.filter((t) => t !== tag))}
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Tag size={32} strokeWidth={1} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Nenhuma etiqueta encontrada.</p>
        </div>
      )}
    </div>
  );
}
