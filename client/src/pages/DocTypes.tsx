import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit3, Trash2, FileText } from "lucide-react";
import { mockDocumentTypes, mockDocuments } from "@/mock/data";

const TYPE_ICONS = ["📄", "📐", "📋", "📑", "📊", "📜", "🏅", "📃"];

export function DocTypes() {
  const [items, setItems] = useState(mockDocumentTypes);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const docCount = (id: number) => mockDocuments.filter((d) => d.typeId === id).length;

  const filtered = items.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setItems((p) => [...p, { id: Date.now(), name: newName.trim(), description: newDesc.trim() }]);
    setNewName(""); setNewDesc(""); setShowForm(false);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tipos de Documento</h1>
          <p className="mt-1 text-sm text-gray-400">Categorias para classificar os documentos do sistema</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
          data-testid="button-add-doctype">
          <Plus size={14} /> Novo Tipo
        </button>
      </div>

      {showForm && (
        <motion.form onSubmit={handleAdd} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#FF201A]/20 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Novo Tipo de Documento</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Nome *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Ex: Relatório de Ensaio"
                className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" data-testid="input-doctype-name" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Descrição</label>
              <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descrição do tipo"
                className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-[#FF201A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e01a14] border border-[#bf0f0c]">Salvar</button>
          </div>
        </motion.form>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar tipos..."
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:border-[#FF201A]" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((type, i) => {
          const count = docCount(type.id);
          const emoji = TYPE_ICONS[i % TYPE_ICONS.length];
          return (
            <motion.div key={type.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all" data-testid={`card-doctype-${type.id}`}>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xl">
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{type.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{type.description}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
                  <FileText size={10} />
                  <span className="font-semibold text-gray-600">{count}</span> documento(s)
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Edit3 size={13} /></button>
                <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <FileText size={32} strokeWidth={1} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Nenhum tipo encontrado.</p>
        </div>
      )}
    </div>
  );
}
