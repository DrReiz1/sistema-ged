import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, X } from "lucide-react";
import { apiRequest, fetchJson, queryClient } from "@/lib/queryClient";
import { type ApiCategory, type ApiDocument } from "@/lib/docstation";

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
    !search
    || type.name.toLowerCase().includes(search.toLowerCase())
    || (type.description ?? "").toLowerCase().includes(search.toLowerCase())
    || type.prefix.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim() || !newPrefix.trim()) {
      return;
    }

    createCategoryMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="operator-surface rounded-[18px] border border-white/70 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Organização documental</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Tipos de documentos</h1>
            <p className="mt-2 text-sm text-gray-500">Defina as categorias usadas no cadastro dos arquivos.</p>
          </div>
          <button
            onClick={() => setShowForm((value) => !value)}
            className="operator-action h-14 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white transition-colors hover:bg-[#e01a14]"
            data-testid="button-add-doctype"
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={18} /> Novo tipo
            </span>
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleAdd}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="operator-card rounded-[18px] border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Novo tipo</h2>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_160px]">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nome</label>
                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  required
                  placeholder="Ex.: Relatorio de ensaio"
                  className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
                  data-testid="input-doctype-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sigla</label>
                <input
                  value={newPrefix}
                  onChange={(event) => setNewPrefix(event.target.value)}
                  required
                  maxLength={5}
                  placeholder="REL"
                  className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base uppercase focus:border-[#FF201A] focus:outline-none"
                  data-testid="input-doctype-prefix"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Descrição</label>
              <input
                value={newDesc}
                onChange={(event) => setNewDesc(event.target.value)}
                placeholder="Quando esse tipo deve ser usado"
                className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base focus:border-[#FF201A] focus:outline-none"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="operator-action h-12 rounded-xl border border-gray-200 px-5 text-base font-medium text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="operator-action h-12 rounded-xl border border-[#bf0f0c] bg-[#FF201A] px-5 text-base font-semibold text-white hover:bg-[#e01a14]">
                {createCategoryMutation.isPending ? "Salvando..." : "Salvar tipo"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="operator-card rounded-[18px] border border-gray-200 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou sigla"
            className="operator-action h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-base text-gray-700 focus:border-[#FF201A] focus:outline-none"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="operator-card rounded-[18px] border border-gray-200 p-5"
              data-testid={`card-doctype-${type.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-[#FF201A]">{type.prefix}</span>
                  <h2 className="mt-3 text-lg font-semibold text-gray-800">{type.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{type.description || "Sem descricao cadastrada."}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{docCount(type.id)}</p>
                  <p className="text-xs text-gray-500">documentos</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="operator-card rounded-[18px] border border-dashed border-gray-300 py-20 text-center">
          <FileText size={40} strokeWidth={1} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-500">Nenhum tipo encontrado.</p>
        </div>
      )}
    </div>
  );
}
