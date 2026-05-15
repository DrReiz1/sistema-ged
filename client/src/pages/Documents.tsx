import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye, FileText, ChevronDown, X, GitBranch } from "lucide-react";
import { Link } from "wouter";
import { mockDocuments, mockDocumentTypes, mockTags } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado:    "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro:        "bg-red-100 text-red-600",
};

const statusLabel: Record<string, string> = {
  indexado:    "Indexado",
  processando: "Processando",
  erro:        "Erro",
};

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
        className={`flex items-center gap-2 rounded-lg border h-11 px-4 text-sm transition-colors ${
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
        <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-1.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center px-3 py-3 text-sm rounded-lg transition-colors ${
                  value === opt.value ? "bg-[#FF201A]/10 text-[#FF201A] font-medium" : "text-gray-600 hover:bg-gray-50"
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
    const matchType   = selectedType   === "all" || doc.typeId === Number(selectedType);
    const matchStatus = selectedStatus === "all" || doc.status === selectedStatus;
    const matchTag    = selectedTag    === "all" || doc.tags.includes(selectedTag);
    return matchSearch && matchType && matchStatus && matchTag;
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Documentos</h1>
        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} documento(s) encontrado(s)</p>
      </div>

      {/* Search + Filters */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            data-testid="input-doc-search"
            placeholder="Buscar por título, código ou etiqueta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] focus:ring-1 focus:ring-[#FF201A]/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SimpleSelect label="Categoria" value={selectedType} onChange={setSelectedType}
            options={[{ value: "all", label: "Todas as categorias" }, ...mockDocumentTypes.map((t) => ({ value: String(t.id), label: t.name }))]} />
          <SimpleSelect label="Status" value={selectedStatus} onChange={setSelectedStatus}
            options={[{ value: "all", label: "Qualquer status" }, { value: "indexado", label: "Indexado" }, { value: "processando", label: "Processando" }, { value: "erro", label: "Erro" }]} />
          <SimpleSelect label="Etiqueta" value={selectedTag} onChange={setSelectedTag}
            options={[{ value: "all", label: "Todas as etiquetas" }, ...mockTags.map((t) => ({ value: t, label: t }))]} />
          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF201A] transition-colors h-11 px-2">
              <X size={13} /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm py-24 flex flex-col items-center gap-4 text-gray-400">
          <FileText size={48} strokeWidth={1} />
          <div className="text-center">
            <p className="text-base font-medium text-gray-600">Nenhum documento encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou a busca</p>
          </div>
          {(search || hasFilters) && (
            <button onClick={() => { setSearch(""); clearAll(); }}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Limpar tudo
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((doc, i) => {
            const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/documents/${doc.id}`}>
                  <div
                    className="group cursor-pointer rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
                    data-testid={`card-doc-${doc.id}`}
                  >
                    {/* Thumbnail */}
                    <div className={`relative flex h-40 md:h-48 items-center justify-center ${doc.status === "erro" ? "bg-red-50" : "bg-gray-100"}`}>
                      <svg viewBox="0 0 80 100" className="h-24 w-20 opacity-15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="70" height="90" rx="6" fill="#555" />
                        <rect x="14" y="18" width="52" height="5" rx="2" fill="white" opacity="0.7" />
                        <rect x="14" y="29" width="52" height="5" rx="2" fill="white" opacity="0.7" />
                        <rect x="14" y="40" width="36" height="5" rx="2" fill="white" opacity="0.7" />
                        <rect x="14" y="56" width="52" height="22" rx="3" fill="white" opacity="0.25" />
                      </svg>
                      {/* File type badge */}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-gray-500 shadow-sm">
                          {doc.fileType}
                        </span>
                      </div>
                      {/* Hover actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 hover:bg-gray-50 shadow-md transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 hover:bg-gray-50 shadow-md transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 font-mono">{doc.code}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{doc.currentRevision}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[40px]">{doc.title}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor[doc.status]}`}>
                          {statusLabel[doc.status] ?? doc.status}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <GitBranch size={11} />
                          <span>{doc.versions.length}</span>
                        </div>
                      </div>
                      {type && (
                        <p className="mt-2 text-[11px] text-gray-400 truncate">{type.name}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
