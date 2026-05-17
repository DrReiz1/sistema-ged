import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Plus, FileText } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiCategory, type ApiDocument } from "@/lib/docstation";

const TYPE_ICONS = ["DOC", "CAD", "OPS", "CHK", "RPT", "ART", "CERT", "CTR"];

export function DocTypes() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrefix, setNewPrefix] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: items = [] } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
    queryFn: () => fetchJson<ApiCategory[]>("/api/categories"),
  });

  const { data: documents = [] } = useQuery<ApiDocument[]>({
    queryKey: ["/api/documents"],
    queryFn: () => fetchJson<ApiDocument[]>("/api/documents"),
  });

  const createCategoryMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/categories", {
      name: newName.trim(),
      prefix: newPrefix.trim().toUpperCase(),
      description: newDesc.trim() || undefined,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewName("");
      setNewPrefix("");
      setNewDesc("");
      setShowForm(false);
    },
  });

  const docCount = (id: string) => documents.filter((document) => document.categoryId === id).length;

  const filtered = items.filter((type) =>
    !search ||
    type.name.toLowerCase().includes(search.toLowerCase()) ||
    (type.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrefix.trim()) return;
    createCategoryMutation.mutate();
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tipos de Documento</h1>
          <p className="mt-1 text-sm text-gray-400">Categorias para classificar os documentos do sistema</p>
        </div>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="flex items-center gap-2 rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e01a14]"
          data-testid="button-add-doctype"
        >
          <Plus size={14} /> Novo Tipo
        </button>
      </div>

      {showForm && (
        <motion.form
          onSubmit={handleAdd}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 rounded-xl border border-[#FF201A]/20 bg-white p-5 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-gray-700">Novo Tipo de Documento</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Nome *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="Ex: Relatorio de Ensaio"
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none"
                data-testid="input-doctype-name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Prefixo *</label>
              <input
                value={newPrefix}
                onChange={(e) => setNewPrefix(e.target.value)}
                required
                maxLength={5}
                placeholder="Ex: REL"
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm uppercase focus:border-[#FF201A] focus:outline-none"
                data-testid="input-doctype-prefix"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Descricao</label>
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descricao do tipo"
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#FF201A] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e01a14]">{createCategoryMutation.isPending ? "Salvando..." : "Salvar"}</button>
          </div>
        </motion.form>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar tipos..."
          className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-[#FF201A] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((type, i) => {
          const count = docCount(type.id);
          const badge = TYPE_ICONS[i % TYPE_ICONS.length];

          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              data-testid={`card-doctype-${type.id}`}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-[11px] font-bold tracking-wide text-[#FF201A]">
                {badge}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{type.name}</p>
                <p className="mt-0.5 text-[11px] font-mono uppercase tracking-wide text-[#FF201A]">{type.prefix}</p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{type.description}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                  <FileText size={10} />
                  <span className="font-semibold text-gray-600">{count}</span> documento(s)
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-[10px] text-gray-300">API</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <FileText size={32} strokeWidth={1} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum tipo encontrado.</p>
        </div>
      )}
    </div>
  );
}
