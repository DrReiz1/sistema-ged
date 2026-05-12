import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Download, Eye, Trash2, Star, GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { mockDocuments, mockDocumentTypes, mockCorrespondents, mockStoragePaths, mockTags } from "@/mock/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

export function Documents() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCorrespondent, setSelectedCorrespondent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  const filtered = mockDocuments.filter((doc) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.code.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q));
    const matchType = selectedType === "all" || doc.typeId === Number(selectedType);
    const corr = mockCorrespondents.find((c) => c.id === doc.correspondentId);
    const matchCorr = selectedCorrespondent === "all" || String(doc.correspondentId) === selectedCorrespondent;
    const matchStatus = selectedStatus === "all" || doc.status === selectedStatus;
    const matchPath = selectedPath === "all" || String(doc.storagePathId) === selectedPath;
    const matchTag = selectedTag === "all" || doc.tags.includes(selectedTag);
    return matchSearch && matchType && matchCorr && matchStatus && matchPath && matchTag;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                data-testid="input-doc-search"
                placeholder="Código, título, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-9 w-44 text-sm" data-testid="select-type">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {mockDocumentTypes.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedCorrespondent} onValueChange={setSelectedCorrespondent}>
              <SelectTrigger className="h-9 w-44 text-sm" data-testid="select-correspondent">
                <SelectValue placeholder="Correspondente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {mockCorrespondents.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedPath} onValueChange={setSelectedPath}>
              <SelectTrigger className="h-9 w-52 text-sm" data-testid="select-path">
                <SelectValue placeholder="Caminho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os caminhos</SelectItem>
                {mockStoragePaths.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.path}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 w-36 text-sm" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="indexado">Indexado</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="erro">Erro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="h-9 w-40 text-sm" data-testid="select-tag">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tags</SelectItem>
                {mockTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-gray-400">{filtered.length} doc(s)</div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Código / Título</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tipo</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Correspondente</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Caminho</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Rev. Vigente</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Revs.</th>
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
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-gray-400">{doc.code}</span>
                              {doc.isFavorite && <Star size={10} className="text-amber-400" fill="currentColor" />}
                            </div>
                            <p className="max-w-[220px] truncate text-sm font-medium text-gray-800 hover:text-[#FF201A]">{doc.title}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-gray-500">{type?.name ?? "-"}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{corr?.name ?? "-"}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] text-gray-400">{path?.path ?? "-"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                        {doc.currentRevision}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <GitBranch size={11} />
                        {doc.versions.length}
                      </div>
                    </td>
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
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">Nenhum documento encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
