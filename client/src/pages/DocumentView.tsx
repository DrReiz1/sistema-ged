import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Trash2, Tag, User, Calendar, FileText, Edit3, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockDocuments } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

export function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const doc = mockDocuments.find((d) => d.id === Number(id));

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FileText size={48} strokeWidth={1} />
        <p className="mt-4 text-lg">Documento não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/documents")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          onClick={() => navigate("/documents")}
          data-testid="button-back"
        >
          <ArrowLeft size={14} /> Voltar
        </Button>
        <div className="h-4 w-px bg-gray-200" />
        <h2 className="text-sm font-medium text-gray-500">Visualização de Documento</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                    <FileText size={20} className="text-[#FF201A]" />
                  </div>
                  <div>
                    <h1 className="text-base font-semibold text-gray-800">{doc.title}</h1>
                    <p className="text-xs text-gray-400">{doc.type} · {doc.size} · {doc.pages} páginas</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusColor[doc.status]}`}>
                  {doc.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex min-h-[480px] items-center justify-center bg-gray-100/60">
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <FileText size={64} strokeWidth={0.8} />
                  <p className="text-sm">Visualização do PDF aqui</p>
                  <p className="text-xs text-gray-400">{doc.pages} páginas · {doc.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-4">
              <Button className="w-full justify-start gap-2 bg-[#FF201A] text-sm text-white hover:bg-[#e01a14]" size="sm" data-testid="button-download">
                <Download size={14} /> Download
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                <Edit3 size={14} /> Editar Metadados
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600" size="sm">
                <Trash2 size={14} /> Excluir
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Metadados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <User size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Correspondente</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700">{doc.correspondent}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Data do Documento</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700">{doc.created}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Adicionado em</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700">{doc.added}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Nº de páginas</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700">{doc.pages}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Tags</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
