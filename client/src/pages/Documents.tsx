import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Filter, Download, Eye, Trash2, Tag, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { mockDocuments, mockTags, mockCorrespondents, type Document } from "@/mock/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

export function Documents() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedCorrespondent, setSelectedCorrespondent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filtered = mockDocuments.filter((doc) => {
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.correspondent.toLowerCase().includes(search.toLowerCase());
    const matchTag = selectedTag === "all" || doc.tags.includes(selectedTag);
    const matchCorr = selectedCorrespondent === "all" || doc.correspondent === selectedCorrespondent;
    const matchStatus = selectedStatus === "all" || doc.status === selectedStatus;
    return matchSearch && matchTag && matchCorr && matchStatus;
  });

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                data-testid="input-doc-search"
                placeholder="Pesquisar documentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 w-40 text-sm" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="indexado">Indexado</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="erro">Erro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCorrespondent} onValueChange={setSelectedCorrespondent}>
              <SelectTrigger className="h-9 w-48 text-sm" data-testid="select-correspondent">
                <SelectValue placeholder="Correspondente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {mockCorrespondents.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="h-9 w-44 text-sm" data-testid="select-tag">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tags</SelectItem>
                {mockTags.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto text-xs text-gray-400">{filtered.length} documento(s)</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Título</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Correspondente</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tags</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Criado</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Páginas</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tamanho</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 transition hover:bg-gray-50/70"
                  data-testid={`row-doc-${doc.id}`}
                >
                  <td className="px-5 py-3">
                    <Link href={`/documents/${doc.id}`}>
                      <div className="flex cursor-pointer items-center gap-2">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
                          <FileText size={14} className="text-[#FF201A]" />
                        </div>
                        <div>
                          <p className="max-w-[240px] truncate text-sm font-medium text-gray-800 hover:text-[#FF201A]">{doc.title}</p>
                          <p className="text-[10px] text-gray-400">{doc.type}</p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{doc.correspondent}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded bg-gray-100 px-1.5 py-0 text-[10px] text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 2 && (
                        <Badge variant="secondary" className="rounded bg-gray-100 px-1.5 py-0 text-[10px] text-gray-500">
                          +{doc.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{doc.created}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{doc.pages}p</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{doc.size}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColor[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/documents/${doc.id}`}>
                        <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600" title="Visualizar">
                          <Eye size={14} />
                        </button>
                      </Link>
                      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600" title="Download">
                        <Download size={14} />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-red-50 hover:text-red-500" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    Nenhum documento encontrado.
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
