import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit3, Trash2, Folder, FileText } from "lucide-react";
import { mockStoragePaths, mockDocuments } from "@/mock/data";

export function StoragePaths() {
  const [items, setItems] = useState(mockStoragePaths);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const docCount = (id: number) => mockDocuments.filter((d) => d.storagePathId === id).length;

  const filtered = items.filter((p) =>
    !search || p.path.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) return;
    setItems((p) => [...p, { id: Date.now(), path: newPath.trim(), description: newDesc.trim() }]);
    setNewPath(""); setNewDesc(""); setShowForm(false);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Caminhos de Armazenamento</h1>
          <p className="mt-1 text-sm text-gray-400">Estrutura lógica de pastas para organizar os documentos</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
          data-testid="button-add-path">
          <Plus size={14} /> Novo Caminho
        </button>
      </div>

      {showForm && (
        <motion.form onSubmit={handleAdd} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#FF201A]/20 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Novo Caminho</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Caminho *</label>
              <input value={newPath} onChange={(e) => setNewPath(e.target.value)} required placeholder="Ex: producao/motores/lote-c"
                className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 font-mono text-sm focus:outline-none focus:border-[#FF201A]" data-testid="input-path" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Descrição</label>
              <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descrição do caminho"
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
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar caminhos..."
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:border-[#FF201A]" />
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Caminho</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Descrição</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Docs</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors" data-testid={`row-path-${p.id}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <Folder size={14} className="text-amber-600" />
                    </div>
                    <span className="font-mono text-sm font-medium text-gray-700">{p.path}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{p.description}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <FileText size={12} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{docCount(p.id)}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Edit3 size={14} /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="py-14 text-center text-sm text-gray-400">Nenhum caminho encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
