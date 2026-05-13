import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, Star, CheckSquare, ChevronRight, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import { mockDocuments, mockDocumentTypes, mockBatchCompletions, dashboardStats } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

export function Home() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  const favorites = mockDocuments.filter((d) => d.isFavorite);
  const recent = mockDocuments.slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate("/documents?q=" + encodeURIComponent(search));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Início</h1>
        <p className="text-sm text-gray-500 mt-1">Bem-vindo ao sistema de gestão de documentos da TSEA</p>
      </div>

      {/* Search hero */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white border border-gray-200 shadow-sm p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Busca Rápida</p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="input-home-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Código, título, tag, correspondente..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] focus:ring-1 focus:ring-[#FF201A]/20 transition-all"
            />
          </div>
          <button type="submit" className="h-11 px-6 rounded-lg bg-[#FF201A] text-white text-sm font-semibold hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]">
            Buscar
          </button>
        </form>
        <div className="flex flex-wrap gap-2 mt-3">
          {["Desenho Técnico", "Procedimento", "NR-10", "Manutenção", "Preventiva"].map((tag) => (
            <button key={tag} onClick={() => navigate(`/documents?q=${tag}`)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-[#FF201A]/10 hover:text-[#FF201A] transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total de documentos", value: dashboardStats.totalDocuments, color: "bg-[#FF201A]" },
          { label: "Adicionados este mês", value: dashboardStats.thisMonth, color: "bg-blue-500" },
          { label: "Em processamento", value: dashboardStats.processing, color: "bg-amber-500" },
          { label: "Usuários ativos", value: dashboardStats.activeUsers, color: "bg-emerald-500" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`h-10 w-1.5 rounded-full ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent documents */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Documentos Recentes</h2>
              <Link href="/documents">
                <button className="flex items-center gap-1 text-xs text-[#FF201A] hover:underline font-medium">
                  Ver todos <ChevronRight size={12} />
                </button>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recent.map((doc) => {
                const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
                return (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <FileText size={15} className="text-[#FF201A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-400">{doc.code}</span>
                          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">{doc.currentRevision}</span>
                          {doc.isFavorite && <Star size={10} className="text-amber-400 fill-amber-400" />}
                        </div>
                        <p className="text-sm font-medium text-gray-700 truncate">{doc.title}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusColor[doc.status]}`}>{doc.status}</span>
                        <span className="text-[11px] text-gray-400">{type?.name}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          {/* Favoritos */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <h2 className="text-sm font-semibold text-gray-700">Favoritos</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {favorites.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.id}`}>
                  <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                    <FileText size={13} className="flex-shrink-0 text-[#FF201A]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400">{doc.code}</p>
                      <p className="text-xs font-medium text-gray-700 truncate">{doc.title}</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 flex-shrink-0">{doc.currentRevision}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Conclusões recentes */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <CheckSquare size={13} className="text-emerald-500" />
              <h2 className="text-sm font-semibold text-gray-700">Conclusões de Lote</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {mockBatchCompletions.map((bc) => (
                <div key={bc.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#FF201A]">{bc.documentCode}</span>
                    <span className="text-[10px] text-gray-400">{bc.batchCode}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{bc.documentTitle}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{bc.operatorName} · {bc.completedAt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ação rápida */}
          <Link href="/upload">
            <button className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#FF201A] text-white text-sm font-semibold hover:bg-[#e01a14] transition-colors border border-[#bf0f0c] shadow-sm">
              <Upload size={15} /> Enviar Documento
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
