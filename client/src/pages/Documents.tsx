import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Eye, FileText, Filter, GitBranch, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { buildAuthenticatedUrl, fetchJson } from "@/lib/queryClient";
import { type ApiCategory, type ApiDocument, type ApiTag, buildDocumentQuery, mapStatusClass, mapStatusLabel } from "@/lib/docstation";

function SimpleSelect({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const hasFilter = value !== "all";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className={`operator-action flex h-14 min-w-[180px] items-center justify-between gap-2 rounded-xl border px-4 text-left text-sm transition-colors ${
          hasFilter
            ? "border-[#FF201A]/40 bg-[#FF201A]/5 font-medium text-[#FF201A]"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
      >
        <span className="truncate">{hasFilter ? selected?.label : label}</span>
        {hasFilter ? (
          <span
            onClick={(event) => {
              event.stopPropagation();
              onChange("all");
              setOpen(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF201A]/12"
          >
            <X size={12} className="text-[#FF201A]" />
          </span>
        ) : (
          <Filter size={16} className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex min-h-[48px] w-full items-center rounded-lg px-3 text-sm transition-colors ${
                value === option.value ? "bg-[#FF201A]/10 font-medium text-[#FF201A]" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Documents() {
  const [, navigate] = useLocation();
  const initialSearch = new URLSearchParams(window.location.search).get("q") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ApiDocument["status"]>("all");
  const [selectedTag, setSelectedTag] = useState("all");

  const { data: categories = [] } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
    queryFn: () => fetchJson<ApiCategory[]>("/api/categories"),
  });

  const { data: tags = [] } = useQuery<ApiTag[]>({
    queryKey: ["/api/tags"],
    queryFn: () => fetchJson<ApiTag[]>("/api/tags"),
  });

  const documentUrl = buildDocumentQuery({
    search: search || undefined,
    categoryId: selectedType !== "all" ? selectedType : undefined,
    tagId: selectedTag !== "all" ? selectedTag : undefined,
  });

  const { data: documents = [] } = useQuery<ApiDocument[]>({
    queryKey: ["/api/documents", search, selectedType, selectedTag],
    queryFn: () => fetchJson<ApiDocument[]>(documentUrl),
  });

  const hasFilters = selectedType !== "all" || selectedStatus !== "all" || selectedTag !== "all";
  const clearAll = () => {
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedTag("all");
  };

  const filtered = documents.filter((document) => selectedStatus === "all" || document.status === selectedStatus);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="operator-surface rounded-[18px] border border-white/70 p-5 md:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Consulta de documentos</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">Documentos</h1>
            </div>
            <div className="rounded-xl bg-[#fff4f3] px-4 py-3 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filtered.length}</span> documento(s) mostrado(s)
            </div>
          </div>

          <div className="rounded-[16px] border border-gray-200 bg-white/90 p-3 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  data-testid="input-doc-search"
                  placeholder="Buscar por titulo, codigo ou descricao"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="operator-action h-14 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-10 text-base text-gray-700 transition-all focus:border-[#FF201A] focus:outline-none focus:ring-2 focus:ring-[#FF201A]/15"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <SimpleSelect
                  label="Escolher categoria"
                  value={selectedType}
                  onChange={setSelectedType}
                  options={[{ value: "all", label: "Todas as categorias" }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
                />
                <SimpleSelect
                  label="Escolher status"
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value as "all" | ApiDocument["status"])}
                  options={[
                    { value: "all", label: "Qualquer status" },
                    { value: "active", label: "Ativo" },
                    { value: "draft", label: "Em revisão" },
                    { value: "archived", label: "Arquivado" },
                  ]}
                />
                <SimpleSelect
                  label="Escolher etiqueta"
                  value={selectedTag}
                  onChange={setSelectedTag}
                  options={[{ value: "all", label: "Todas as etiquetas" }, ...tags.map((tag) => ({ value: tag.id, label: tag.name }))]}
                />
                {hasFilters && (
                  <button onClick={clearAll} className="operator-action h-14 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-500 hover:bg-gray-50">
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="operator-card rounded-[18px] border border-gray-200 py-20">
          <div className="flex flex-col items-center gap-4 text-center text-gray-400">
            <FileText size={52} strokeWidth={1.2} />
            <div>
              <p className="text-lg font-semibold text-gray-700">Nenhum documento encontrado</p>
              <p className="mt-1 text-sm">Tente ajustar os filtros ou trocar o texto da busca.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((document, index) => (
            <motion.div key={document.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Link href={`/documents/${document.id}`}>
                <div
                  className="operator-card group cursor-pointer rounded-[18px] border border-gray-200 p-4 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
                  data-testid={`card-doc-${document.id}`}
                >
                  <div className={`flex min-h-[158px] items-center justify-center rounded-[16px] ${document.status === "archived" ? "bg-slate-100" : "bg-gray-100"}`}>
                    <svg viewBox="0 0 80 100" className="h-28 w-24 opacity-15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="5" width="70" height="90" rx="6" fill="#555" />
                      <rect x="14" y="18" width="52" height="5" rx="2" fill="white" opacity="0.7" />
                      <rect x="14" y="29" width="52" height="5" rx="2" fill="white" opacity="0.7" />
                      <rect x="14" y="40" width="36" height="5" rx="2" fill="white" opacity="0.7" />
                      <rect x="14" y="56" width="52" height="22" rx="3" fill="white" opacity="0.25" />
                    </svg>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">{document.code}</span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">{document.currentRevision?.revisionNumber ?? "SEM REV"}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${mapStatusClass(document.status)}`}>
                      {mapStatusLabel(document.status)}
                    </span>
                  </div>

                  <p className="mt-3 min-h-[52px] text-lg font-semibold leading-6 text-gray-800">{document.title}</p>
                  <p className="mt-2 text-sm text-gray-500">{document.category?.name ?? "Sem categoria"}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      className="operator-action flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(`/documents/${document.id}`);
                      }}
                    >
                      <Eye size={16} /> Abrir
                    </button>
                    <button
                      className="operator-action flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={(event) => {
                        event.preventDefault();
                        window.open(buildAuthenticatedUrl(`/api/documents/${document.id}/download`), "_blank", "noopener,noreferrer");
                      }}
                    >
                      <Download size={16} /> Baixar
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <GitBranch size={14} />
                      <span>{document.revisions.length} revisão(ões)</span>
                    </div>
                    <span className="font-medium text-[#FF201A] transition-transform group-hover:translate-x-0.5">Entrar</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
