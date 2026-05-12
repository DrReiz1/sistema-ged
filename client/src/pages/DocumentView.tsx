import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Trash2, Tag, User, Calendar, FileText, Edit3, Hash, GitBranch, CheckCircle, Shield, Clock, HardDrive, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockDocuments, mockDocumentTypes, mockCorrespondents, mockStoragePaths } from "@/mock/data";

const statusColor: Record<string, string> = {
  indexado: "bg-emerald-100 text-emerald-700",
  processando: "bg-amber-100 text-amber-700",
  erro: "bg-red-100 text-red-600",
};

export function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [batchDone, setBatchDone] = useState(false);

  const doc = mockDocuments.find((d) => d.id === Number(id));
  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FileText size={48} strokeWidth={1} />
        <p className="mt-4 text-lg">Documento não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/documents")}>Voltar</Button>
      </div>
    );
  }

  const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
  const corr = mockCorrespondents.find((c) => c.id === doc.correspondentId);
  const path = mockStoragePaths.find((p) => p.id === doc.storagePathId);
  const currentVersion = doc.versions.find((v) => v.isCurrent);
  const olderVersions = doc.versions.filter((v) => !v.isCurrent);

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBatchDone(true);
    setShowBatchForm(false);
    setBatchCode("");
    setBatchNotes("");
    setTimeout(() => setBatchDone(false), 4000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-gray-500 hover:text-gray-800" onClick={() => navigate("/documents")} data-testid="button-back">
          <ArrowLeft size={14} /> Documentos
        </Button>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-sm font-medium text-gray-500">{doc.code}</span>
      </div>

      {/* Batch completion success */}
      <AnimatePresence>
        {batchDone && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">
            <CheckCircle size={16} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">Conclusão de lote registrada com sucesso!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                    <FileText size={20} className="text-[#FF201A]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">{doc.code}</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">{doc.currentRevision} — VIGENTE</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColor[doc.status]}`}>{doc.status}</span>
                    </div>
                    <h1 className="mt-0.5 text-base font-semibold text-gray-800">{doc.title}</h1>
                    <p className="mt-0.5 text-xs text-gray-400">{doc.fileType} · {currentVersion?.size} · {doc.pages} páginas</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex min-h-[420px] items-center justify-center bg-gray-100/60">
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <FileText size={64} strokeWidth={0.8} />
                  <p className="text-sm font-medium">Visualizador de Documento</p>
                  <p className="text-xs text-gray-400">{doc.code}_{doc.currentRevision}.{doc.fileType.toLowerCase()} · {doc.pages} páginas</p>
                  <p className="text-[11px] font-mono text-gray-300">{currentVersion?.filePath}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <GitBranch size={14} className="text-gray-400" /> Histórico de Revisões
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Revisão</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Enviado por</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Data</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Descrição</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tamanho</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.versions.map((v) => (
                    <tr key={v.id} className={`border-b border-gray-50 ${v.isCurrent ? "bg-blue-50/30" : "hover:bg-gray-50/60"}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${v.isCurrent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                            {v.revision}
                          </span>
                          {v.isCurrent && <span className="text-[10px] font-semibold text-emerald-600">VIGENTE</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">{v.uploadedBy}</td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{v.uploadedAt}</td>
                      <td className="px-5 py-3 max-w-[200px]">
                        <p className="truncate text-xs text-gray-600">{v.changeDescription}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">{v.size}</td>
                      <td className="px-5 py-3 text-right">
                        {v.isCurrent ? (
                          <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 ml-auto" title="Download vigente">
                            <Download size={13} />
                          </button>
                        ) : (
                          <button className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-[11px] text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                            <Download size={11} /> Baixar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Actions */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-4">
              <Button className="w-full justify-start gap-2 bg-[#FF201A] text-sm text-white hover:bg-[#e01a14]" size="sm" data-testid="button-download">
                <Download size={14} /> Download Versão Vigente
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                <Edit3 size={14} /> Editar Metadados
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-sm text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                size="sm"
                onClick={() => setShowBatchForm((v) => !v)}
                data-testid="button-batch-completion"
              >
                <CheckSquare size={14} /> Registrar Conclusão de Lote
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600" size="sm">
                <Trash2 size={14} /> Excluir (Lógico)
              </Button>
            </CardContent>
          </Card>

          {/* Batch Completion Form */}
          <AnimatePresence>
            {showBatchForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Card className="border border-emerald-200 bg-emerald-50/50 shadow-sm">
                  <CardHeader className="border-b border-emerald-100 px-5 py-3">
                    <CardTitle className="text-sm font-semibold text-emerald-700">Conclusão de Lote / Operação</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <form onSubmit={handleBatchSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-600">Código do Lote / OS</Label>
                        <Input value={batchCode} onChange={(e) => setBatchCode(e.target.value)} placeholder="Ex: LOTE-2025-001" className="h-8 text-sm" required data-testid="input-batch-code" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-600">Observações</Label>
                        <textarea
                          value={batchNotes}
                          onChange={(e) => setBatchNotes(e.target.value)}
                          placeholder="Descreva a atividade realizada..."
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          rows={3}
                          data-testid="input-batch-notes"
                        />
                      </div>
                      <Button type="submit" className="w-full gap-2 bg-emerald-600 text-sm text-white hover:bg-emerald-700" size="sm">
                        <CheckCircle size={13} /> Confirmar Conclusão
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Metadados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <MetaRow icon={<Hash size={13} />} label="Código" value={doc.code} mono />
              <MetaRow icon={<FileText size={13} />} label="Tipo" value={type?.name ?? "-"} />
              <MetaRow icon={<User size={13} />} label="Correspondente" value={corr?.name ?? "-"} />
              <MetaRow icon={<HardDrive size={13} />} label="Caminho" value={path?.path ?? "-"} mono />
              <MetaRow icon={<Calendar size={13} />} label="Criado em" value={doc.created} />
              <MetaRow icon={<Calendar size={13} />} label="Adicionado em" value={doc.added} />
              <MetaRow icon={<Hash size={13} />} label="Páginas" value={String(doc.pages)} />
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-gray-400"><Tag size={13} /></span>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded bg-gray-100 px-1.5 py-0 text-[10px] text-gray-600">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checksum */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Shield size={13} className="text-gray-400" /> Integridade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Checksum (UUID)</p>
                <p className="mt-1 break-all font-mono text-[11px] text-gray-500">{currentVersion?.checksum}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Caminho Físico</p>
                <p className="mt-1 break-all font-mono text-[11px] text-gray-500">{currentVersion?.filePath}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Enviado por</p>
                <p className="mt-1 text-xs text-gray-600">{currentVersion?.uploadedBy} · {currentVersion?.uploadedAt}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function MetaRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0 text-gray-400">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
        <p className={`mt-0.5 text-xs font-medium text-gray-700 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
