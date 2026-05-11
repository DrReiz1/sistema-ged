import { motion } from "framer-motion";
import { FileText, TrendingUp, AlertCircle, Clock, Upload, Search, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { dashboardStats, mockDocuments } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-700",
};

const statCards = [
  { label: "Total de Documentos", value: dashboardStats.totalDocuments, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Adicionados este mês", value: dashboardStats.thisMonth, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Em processamento", value: dashboardStats.processing, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Com erros", value: dashboardStats.errors, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
];

export function Home() {
  const recent = mockDocuments.slice(0, 5);
  const storagePercent = Math.round((4.7 / 20) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
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
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Documentos Recentes</CardTitle>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-[#FF201A] hover:text-[#FF201A]">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Título</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Correspondente</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Páginas</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-50 transition hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="flex-shrink-0 text-gray-400" />
                          <span className="max-w-[260px] truncate text-sm font-medium text-gray-700">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{doc.correspondent}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColor[doc.status]}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{doc.pages}p</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Armazenamento</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">{dashboardStats.storageUsed}</span>
                <span className="text-xs text-gray-400">/ {dashboardStats.storageTotal}</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-[#FF201A]"
                  initial={{ width: 0 }}
                  animate={{ width: `${storagePercent}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">{storagePercent}% utilizado</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
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

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Tags Populares</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 p-4">
              {["Manutenção", "Contrato", "Inspeção", "ART", "NR-10", "Projeto", "Laudo"].map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer rounded-md bg-gray-100 text-xs text-gray-600 hover:bg-gray-200">
                  {tag}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
