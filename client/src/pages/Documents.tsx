import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye, List, Grid, Star, GitBranch, ChevronDown, X } from "lucide-react";
import { Link } from "wouter";
import { mockDocuments, mockDocumentTypes, mockCorrespondents, mockStoragePaths, mockTags } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

type ViewMode = "grid" | "list";

function FilterDropdown({ label, icon, options, value, onChange }: {
  label: string; icon?: React.ReactNode; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const hasFilter = value !== "all";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
          hasFilter
            ? "border-[#FF201A]/40 bg-[#FF201A]/5 text-[#FF201A]"
            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
        }`}
      >
        {icon && <span className="opacity-60">{icon}</span>}
        <span className="font-medium">{hasFilter ? selected?.label : label}</span>
        {hasFilter ? (
          <span onClick={(e) => { e.stopPropagation(); onChange("all"); setOpen(false); }}
            className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF201A]/20 hover:bg-[#FF201A]/30">
            <X size={9} className="text-[#FF201A]" />
          </span>
        ) : (
          <ChevronDown size={13} />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-1">
            {options.map((opt) => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  value === opt.value ? "bg-[#FF201A]/10 text-[#FF201A] font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}>
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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCorrespondent, setSelectedCorrespondent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  const hasFilters = selectedType !== "all" || selectedCorrespondent !== "all" || selectedStatus !== "all" || selectedPath !== "all" || selectedTag !== "all";

  const clearAll = () => {
    setSelectedType("all"); setSelectedCorrespondent("all");
    setSelectedStatus("all"); setSelectedPath("all"); setSelectedTag("all");
  };

  const filtered = mockDocuments.filter((doc) => {
    const q = search.toLowerCase();
    const matchSearch = !q || doc.title.toLowerCase().includes(q) || doc.code.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q) || doc.tags.some((t) => t.toLowerCase().includes(q));
    const matchType = selectedType === "all" || doc.typeId === Number(selectedType);
    const matchCorr = selectedCorrespondent === "all" || String(doc.correspondentId) === selectedCorrespondent;
    const matchStatus = selectedStatus === "all" || doc.status === selectedStatus;
    const matchPath = selectedPath === "all" || String(doc.storagePathId) === selectedPath;
    const matchTag = selectedTag === "all" || doc.tags.includes(selectedTag);
    return matchSearch && matchType && matchCorr && matchStatus && matchPath && matchTag;
  });

  return (
    <div className="space-y-3">
      {/* Page title + actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Documentos</h1>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{filtered.length} documento(s)</span>
        </div>
      </div>

      {/* Search bar + view toggle */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="input-doc-search"
              placeholder="Título & conteúdo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] focus:ring-1 focus:ring-[#FF201A]/20 transition-all"
            />
          </div>

          {/* Selecione / view controls */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className="text-xs text-gray-400 mr-1">Selecione:</span>
            <button className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              Todos ✓
            </button>
          </div>

          {/* View mode */}
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setViewMode("list")}
              className={`flex h-9 w-9 items-center justify-center transition-colors ${viewMode === "list" ? "bg-[#FF201A] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode("grid")}
              className={`flex h-9 w-9 items-center justify-center transition-colors ${viewMode === "grid" ? "bg-[#FF201A] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <FilterDropdown label="Etiquetas" value={selectedTag} onChange={setSelectedTag}
            options={[{ value: "all", label: "Todas as etiquetas" }, ...mockTags.map((t) => ({ value: t, label: t }))]} />
          <FilterDropdown label="Correspondente" value={selectedCorrespondent} onChange={setSelectedCorrespondent}
            options={[{ value: "all", label: "Todos" }, ...mockCorrespondents.map((c) => ({ value: String(c.id), label: c.name }))]} />
          <FilterDropdown label="Tipo de Documento" value={selectedType} onChange={setSelectedType}
            options={[{ value: "all", label: "Todos os tipos" }, ...mockDocumentTypes.map((t) => ({ value: String(t.id), label: t.name }))]} />
          <FilterDropdown label="Caminho de armazenamento" value={selectedPath} onChange={setSelectedPath}
            options={[{ value: "all", label: "Todos os caminhos" }, ...mockStoragePaths.map((p) => ({ value: String(p.id), label: p.path }))]} />
          <FilterDropdown label="Status" value={selectedStatus} onChange={setSelectedStatus}
            options={[{ value: "all", label: "Todos" }, { value: "indexado", label: "Indexado" }, { value: "processando", label: "Processando" }, { value: "erro", label: "Erro" }]} />
          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#FF201A] transition-colors ml-1">
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Document grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((doc, i) => {
            const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/documents/${doc.id}`}>
                  <div className="group cursor-pointer rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300 transition-all" data-testid={`card-doc-${doc.id}`}>
                    {/* Thumbnail */}
                    <div className="relative flex h-44 items-center justify-center bg-gray-100">
                      {doc.status === "erro" && <div className="absolute inset-0 bg-gray-200" />}
                      <div className={`flex h-full w-full items-center justify-center ${doc.status === "erro" ? "bg-gray-300" : "bg-gray-100"}`}>
                        <svg viewBox="0 0 80 100" className="h-28 w-20 opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="5" y="5" width="70" height="90" rx="4" fill="#888" />
                          <rect x="14" y="20" width="52" height="4" rx="2" fill="white" opacity="0.6" />
                          <rect x="14" y="30" width="52" height="4" rx="2" fill="white" opacity="0.6" />
                          <rect x="14" y="40" width="40" height="4" rx="2" fill="white" opacity="0.6" />
                          <rect x="14" y="55" width="52" height="20" rx="2" fill="white" opacity="0.2" />
                        </svg>
                      </div>
                      {doc.isFavorite && (
                        <div className="absolute top-2 right-2">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-gray-700 hover:bg-white shadow-sm">
                          <Eye size={13} />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-gray-700 hover:bg-white shadow-sm">
                          <Download size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-gray-400">{doc.code}</span>
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">{doc.currentRevision}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-tight">{doc.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize ${statusColor[doc.status]}`}>{doc.status}</span>
                        <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
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
      ) : (
        /* List mode */
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Código / Título</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tipo</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Correspondente</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Caminho</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Rev.</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => {
                const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
                const corr = mockCorrespondents.find((c) => c.id === doc.correspondentId);
                const path = mockStoragePaths.find((p) => p.id === doc.storagePathId);
                return (
                  <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors" data-testid={`row-doc-${doc.id}`}>
                    <td className="px-5 py-3">
                      <Link href={`/documents/${doc.id}`}>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
                            <svg viewBox="0 0 16 16" className="h-4 w-4 text-[#FF201A]" fill="currentColor"><path d="M4 0h8l4 4v12H0V0h4zm7 1H4v4H1v10h14V5h-4V1zm0 4V1.7L14.3 5H11z"/></svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-400">{doc.code}</span>
                              {doc.isFavorite && <Star size={10} className="text-amber-400 fill-amber-400" />}
                            </div>
                            <p className="text-sm font-medium text-gray-700 hover:text-[#FF201A] max-w-[200px] truncate">{doc.title}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{type?.name ?? "-"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{corr?.name ?? "-"}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-gray-400">{path?.path ?? "-"}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{doc.currentRevision}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusColor[doc.status]}`}>{doc.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/documents/${doc.id}`}>
                          <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Eye size={14} /></button>
                        </Link>
                        <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Download size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">Nenhum documento encontrado.</div>
          )}
        </div>
      )}

      {filtered.length === 0 && viewMode === "grid" && (
        <div className="py-16 text-center text-sm text-gray-400">Nenhum documento encontrado.</div>
      )}
    </div>
  );
}
