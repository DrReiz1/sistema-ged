import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye, FileText, ChevronDown, X, List, Grid, GitBranch } from "lucide-react";
import { Link } from "wouter";
import { mockDocuments, mockDocumentTypes, mockTags } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

const statusLabel: Record<string, string> = {
  indexado: "Indexado",
  processando: "Processando",
  erro: "Erro",
};

type ViewMode = "list" | "grid";

function SimpleSelect({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const hasFilter = value !== "all";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border h-10 px-3 text-sm transition-colors ${
          hasFilter
            ? "border-[#FF201A]/50 bg-[#FF201A]/5 text-[#FF201A] font-medium"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
      >
        <span>{hasFilter ? selected?.label : label}</span>
        {hasFilter ? (
          <span
            onClick={(e) => { e.stopPropagation(); onChange("all"); setOpen(false); }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF201A]/20 hover:bg-[#FF201A]/30"
          >
            <X size={10} className="text-[#FF201A]" />
          </span>
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-1.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  value === opt.value
                    ? "bg-[#FF201A]/10 text-[#FF201A] font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Documents() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  const hasFilters = selectedType !== "all" || selectedStatus !== "all" || selectedTag !== "all";

  const clearAll = () => {
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedTag("all");
  };

  const filtered = mockDocuments.filter((doc) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.code.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q));
    const matchType = selectedType === "all" || doc.typeId === Number(selectedType);
    const matchStatus = selectedStatus === "all" || doc.status === selectedStatus;
    const matchTag = selectedTag === "all" || doc.tags.includes(selectedTag);
    return matchSearch && matchType && matchStatus && matchTag;
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Documentos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} documento(s) encontrado(s)</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="input-doc-search"
              placeholder="Buscar por título, código ou etiqueta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] focus:ring-1 focus:ring-[#FF201A]/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
            <button
              data-testid="button-view-list"
              onClick={() => setViewMode("list")}
              title="Visualização em lista"
              className={`flex h-11 w-11 items-center justify-center transition-colors ${viewMode === "list" ? "bg-[#FF201A] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <List size={17} />
            </button>
            <button
              data-testid="button-view-grid"
              onClick={() => setViewMode("grid")}
              title="Visualização em grade"
              className={`flex h-11 w-11 items-center justify-center transition-colors ${viewMode === "grid" ? "bg-[#FF201A] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <Grid size={17} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SimpleSelect
            label="Categoria"
            value={selectedType}
            onChange={setSelectedType}
            options={[
              { value: "all", label: "Todas as categorias" },
              ...mockDocumentTypes.map((t) => ({ value: String(t.id), label: t.name })),
            ]}
          />
          <SimpleSelect
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "all", label: "Qualquer status" },
              { value: "indexado", label: "Indexado" },
              { value: "processando", label: "Processando" },
              { value: "erro", label: "Erro" },
            ]}
          />
          <SimpleSelect
            label="Etiqueta"
            value={selectedTag}
            onChange={setSelectedTag}
            options={[
              { value: "all", label: "Todas as etiquetas" },
              ...mockTags.map((t) => ({ value: t, label: t })),
            ]}
          />
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF201A] transition-colors h-10 px-2"
            >
              <X size={13} /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm py-20 flex flex-col items-center gap-3 text-gray-400">
          <FileText size={40} strokeWidth={1.2} />
          <p className="text-base font-medium">Nenhum documento encontrado</p>
          <p className="text-sm">Tente ajustar os filtros ou a busca</p>
          {(search || hasFilters) && (
            <button
              onClick={() => { setSearch(""); clearAll(); }}
              className="mt-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Limpar tudo
            </button>
          )}
        </div>
      )}

      {/* Grid view */}
      {filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((doc, i) => {
            const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/documents/${doc.id}`}>
                  <div
                    className="group cursor-pointer rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
                    data-testid={`card-doc-${doc.id}`}
                  >
                    <div className="relative flex h-32 md:h-44 items-center justify-center bg-gray-100">
                      <div className={`flex h-full w-full items-center justify-center ${doc.status === "erro" ? "bg-gray-200" : "bg-gray-100"}`}>
                        <svg viewBox="0 0 80 100" className="h-20 w-16 md:h-28 md:w-20 opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="5" y="5" width="70" height="90" rx="4" fill="#888" />
                          <rect x="14" y="20" width="52" height="4" rx="2" fill="white" opacity="0.6" />
                          <rect x="14" y="30" width="52" height="4" rx="2" fill="white" opacity="0.6" />
                          <rect x="14" y="40" width="40" height="4" rx="2" fill="white" opacity="0.6" />
                          <rect x="14" y="55" width="52" height="20" rx="2" fill="white" opacity="0.2" />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-gray-700 hover:bg-white shadow-sm">
                          <Eye size={13} />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-gray-700 hover:bg-white shadow-sm">
                          <Download size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="p-2 md:p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] font-bold text-gray-400">{doc.code}</span>
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">{doc.currentRevision}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-tight">{doc.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${statusColor[doc.status]}`}>
                          {statusLabel[doc.status] ?? doc.status}
                        </span>
                        <div className="hidden md:flex items-center gap-0.5 text-[10px] text-gray-400">
                          <GitBranch size={10} /> {doc.versions.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {filtered.length > 0 && viewMode === "list" && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Documento</span>
            <span className="hidden md:block text-xs font-semibold uppercase tracking-wide text-gray-400">Categoria</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 text-right">Ações</span>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.map((doc, i) => {
              const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  data-testid={`row-doc-${doc.id}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
                >
                  <Link href={`/documents/${doc.id}`}>
                    <div className="flex items-center gap-3 cursor-pointer min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                        <FileText size={17} className="text-[#FF201A]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-400">{doc.code}</span>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{doc.currentRevision}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[220px] md:max-w-[400px] hover:text-[#FF201A]">
                          {doc.title}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <span className="hidden md:block text-sm text-gray-500 whitespace-nowrap">
                    {type?.name ?? "-"}
                  </span>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusColor[doc.status]}`}>
                    {statusLabel[doc.status] ?? doc.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <Link href={`/documents/${doc.id}`}>
                      <button
                        data-testid={`button-view-doc-${doc.id}`}
                        title="Ver documento"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </Link>
                    <button
                      data-testid={`button-download-doc-${doc.id}`}
                      title="Baixar"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
