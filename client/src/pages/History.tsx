import { motion } from "framer-motion";
import { Upload, Edit3, Download, Eye, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockHistory } from "@/mock/data";
import { useState } from "react";

const actionIcon: Record<string, React.ReactNode> = {
  Upload: <Upload size={13} className="text-blue-500" />,
  Edição: <Edit3 size={13} className="text-amber-500" />,
  Download: <Download size={13} className="text-emerald-500" />,
  Visualização: <Eye size={13} className="text-gray-400" />,
  Exclusão: <Trash2 size={13} className="text-red-500" />,
};

const actionBg: Record<string, string> = {
  Upload: "bg-blue-50",
  Edição: "bg-amber-50",
  Download: "bg-emerald-50",
  Visualização: "bg-gray-50",
  Exclusão: "bg-red-50",
};

export function History() {
  const [search, setSearch] = useState("");

  const filtered = mockHistory.filter(
    (h) =>
      h.document.toLowerCase().includes(search.toLowerCase()) ||
      h.user.toLowerCase().includes(search.toLowerCase()) ||
      h.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                data-testid="input-history-search"
                placeholder="Filtrar por documento, usuário ou ação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
            <div className="text-xs text-gray-400">{filtered.length} registro(s)</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ação</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Documento</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Usuário</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Data</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-50 transition hover:bg-gray-50/60"
                  data-testid={`row-history-${entry.id}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md ${actionBg[entry.action]}`}>
                        {actionIcon[entry.action]}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{entry.action}</span>
                    </div>
                  </td>
                  <td className="max-w-[240px] px-5 py-3">
                    <p className="truncate text-sm text-gray-700">{entry.document}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{entry.user}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{entry.detail}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-gray-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
