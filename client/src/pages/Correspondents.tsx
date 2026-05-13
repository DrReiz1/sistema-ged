import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit3, Trash2, User, FileText } from "lucide-react";
import { mockCorrespondents, mockDocuments } from "@/mock/data";

export function Correspondents() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [items, setItems] = useState(mockCorrespondents);

  const filtered = items.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );

  const docCount = (id: number) => mockDocuments.filter((d) => d.correspondentId === id).length;

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
          <h1 className="text-3xl font-bold text-gray-800">Correspondentes</h1>
          <p className="mt-1 text-sm text-gray-400">Pessoas ou entidades associadas aos documentos</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
          data-testid="button-add-correspondent">
          <Plus size={14} /> Novo Correspondente
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <motion.form onSubmit={handleAdd} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#FF201A]/20 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Novo Correspondente</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Nome *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Ex: ABB Ltda."
                className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" data-testid="input-correspondent-name" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Descrição</label>
              <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descrição opcional"
                className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[#FF201A]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-[#FF201A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e01a14] border border-[#bf0f0c]">Salvar</button>
          </div>
        </motion.form>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar correspondentes..."
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:border-[#FF201A]" data-testid="input-search-correspondent" />
      </div>

      {/* List */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Correspondente</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Descrição</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Docs vinculados</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors" data-testid={`row-correspondent-${c.id}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <User size={14} className="text-[#FF201A]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500 max-w-[220px]">
                  <p className="truncate">{c.description || <span className="text-gray-300 italic">Sem descrição</span>}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <FileText size={13} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{docCount(c.id)}</span>
                    <span className="text-gray-400">documento(s)</span>
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
              <tr><td colSpan={4} className="py-14 text-center text-sm text-gray-400">Nenhum correspondente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
