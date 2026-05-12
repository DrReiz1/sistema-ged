import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, AlertCircle, Clock, Upload, Search, HardDrive, Star, CheckSquare, Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { dashboardStats, mockDocuments, mockBatchCompletions, mockDocumentTypes, mockStoragePaths } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

const revisionColor = "bg-blue-100 text-blue-700";

const statCards = [
  { label: "Total de Documentos", value: dashboardStats.totalDocuments, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Adicionados este mês", value: dashboardStats.thisMonth, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Em processamento", value: dashboardStats.processing, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Usuários ativos", value: dashboardStats.activeUsers, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
];

export function Home() {
  const [, navigate] = useLocation();
  const [searchValue, setSearchValue] = useState("");

  const favorites = mockDocuments.filter((d) => d.isFavorite);
  const recent = mockDocuments.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) navigate("/documents?q=" + encodeURIComponent(searchValue));
  };

  return (
    <div className="space-y-6">
      {/* Quick Search Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#FF201A]/20 bg-gradient-to-br from-[#1c1f2e] to-[#2a2f45] p-6 text-white"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">TSEA DocStation</p>
        <h2 className="mt-1 text-xl font-bold">Busca Rápida de Documentos</h2>
        <p className="mt-0.5 text-sm text-white/60">Localize desenhos, procedimentos e instruções de trabalho</p>
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              data-testid="input-home-search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Código, título, tag, correspondente..."
              className="h-10 border-white/10 bg-white/10 pl-9 text-sm text-white placeholder:text-white/40 focus-visible:ring-white/20"
            />
          </div>
          <Button type="submit" className="h-10 bg-[#FF201A] px-5 text-sm font-semibold text-white hover:bg-[#e01a14]">
            Buscar
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Desenho Técnico", "Procedimento", "NR-10", "Manutenção"].map((tag) => (
            <button key={tag} onClick={() => navigate(`/documents?q=${tag}`)} className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/70 transition hover:bg-white/20 hover:text-white">
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-1.5 text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Documents */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Documentos Recentes</CardTitle>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-[#FF201A] hover:text-[#FF201A]">
                  Ver todos <ChevronRight size={12} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Código / Título</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Rev.</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((doc) => {
                    const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
                    return (
                      <tr key={doc.id} className="border-b border-gray-50 transition hover:bg-gray-50/60">
                        <td className="px-5 py-3">
                          <Link href={`/documents/${doc.id}`}>
                            <div className="flex cursor-pointer items-center gap-2">
                              <FileText size={13} className="flex-shrink-0 text-[#FF201A]" />
                              <div>
                                <span className="text-[11px] font-bold text-gray-400">{doc.code}</span>
                                <p className="max-w-[200px] truncate text-sm font-medium text-gray-700 hover:text-[#FF201A]">{doc.title}</p>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${revisionColor}`}>
                            {doc.currentRevision}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColor[doc.status]}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">{type?.name ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          {/* Favorites */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Star size={14} className="text-amber-400" /> Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 p-3">
              {favorites.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.id}`}>
                  <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-gray-50">
                    <FileText size={13} className="flex-shrink-0 text-[#FF201A]" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-400">{doc.code}</p>
                      <p className="truncate text-xs font-medium text-gray-700">{doc.title}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-blue-600">{doc.currentRevision}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Pending batch completions */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CheckSquare size={14} className="text-emerald-500" /> Conclusões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-3">
              {mockBatchCompletions.slice(0, 3).map((bc) => (
                <div key={bc.id} className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#FF201A]">{bc.documentCode}</span>
                    <span className="text-[10px] text-gray-400">{bc.batchCode}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-600">{bc.documentTitle}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">{bc.operatorName} · {bc.completedAt}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Armazenamento */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <HardDrive size={14} className="text-gray-400" /> Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">{dashboardStats.storageUsed}</span>
                <span className="text-xs text-gray-400">/ {dashboardStats.storageTotal}</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div className="h-full rounded-full bg-[#FF201A]" initial={{ width: 0 }} animate={{ width: `${dashboardStats.storagePercent}%` }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">{dashboardStats.storagePercent}% utilizado</p>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-4">
              <Link href="/upload">
                <Button className="w-full justify-start gap-2 bg-[#FF201A] text-sm text-white hover:bg-[#e01a14]" size="sm">
                  <Upload size={14} /> Enviar Documento
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                  <Search size={14} /> Buscar Documentos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
