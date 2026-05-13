import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Trash2, Tag, User, Calendar, FileText, Edit3, Hash, GitBranch, CheckCircle, Shield, HardDrive, CheckSquare, Star, Upload } from "lucide-react";
import { mockDocuments, mockDocumentTypes, mockCorrespondents, mockStoragePaths } from "@/mock/data";
import { getRole, roleConfig } from "@/lib/roles";

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

  const { data: user } = useQuery<{ id: string; username: string; role: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });
  const role = getRole(user?.role);
  const perms = roleConfig[role];

  const doc = mockDocuments.find((d) => d.id === Number(id));

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FileText size={48} strokeWidth={1} />
        <p className="mt-4 text-lg">Documento não encontrado.</p>
        <button className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50" onClick={() => navigate("/documents")}>Voltar</button>
      </div>
    );
  }

  const type = mockDocumentTypes.find((t) => t.id === doc.typeId);
  const corr = mockCorrespondents.find((c) => c.id === doc.correspondentId);
  const path = mockStoragePaths.find((p) => p.id === doc.storagePathId);
  const currentVersion = doc.versions.find((v) => v.isCurrent);

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBatchDone(true);
    setShowBatchForm(false);
    setBatchCode("");
    setBatchNotes("");
    setTimeout(() => setBatchDone(false), 4000);
  };

  const ActionsPanel = ({ testIdSuffix = "" }: { testIdSuffix?: string }) => (
    <div className="flex flex-col gap-2 p-4">
      <button
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
        data-testid={`button-download${testIdSuffix}`}
      >
        <Download size={14} /> Baixar Versão Vigente
      </button>

      {perms.canEditMetadata && (
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Edit3 size={14} /> Editar Metadados
        </button>
      )}

      {perms.canBatchCompletion && (
        <button
          onClick={() => setShowBatchForm((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
          data-testid={`button-batch-completion${testIdSuffix}`}
        >
          <CheckSquare size={14} /> Registrar Conclusão de Lote
        </button>
      )}

      {perms.canPublishRevision && (
        <button
          onClick={() => navigate("/upload")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Upload size={14} /> Publicar Nova Revisão
        </button>
      )}

      {perms.canDelete && (
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={14} /> Excluir Documento
        </button>
      )}

      {role === "operador" && (
        <p className="text-center text-[10px] text-gray-400 mt-1">
          Permissões limitadas ao perfil Operador
        </p>
      )}
    </div>
  );

  const BatchForm = () => (
    <AnimatePresence>
      {showBatchForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
          <div className="border-b border-emerald-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-emerald-700">Conclusão de Lote / Operação</h2>
          </div>
          <form onSubmit={handleBatchSubmit} className="space-y-3 p-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Código do Lote / OS</label>
              <input value={batchCode} onChange={(e) => setBatchCode(e.target.value)} placeholder="Ex: LOTE-2025-001"
                className="w-full rounded-lg border border-gray-200 bg-white h-9 px-3 text-sm focus:outline-none focus:border-emerald-400" required data-testid="input-batch-code" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Observações</label>
              <textarea value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)} rows={3}
                placeholder="Descreva a atividade realizada..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" data-testid="input-batch-notes" />
            </div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
              <CheckCircle size={13} /> Confirmar Conclusão
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 md:space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => navigate("/documents")}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 md:px-3 py-1.5 text-xs md:text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft size={13} /> Documentos
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-xs md:text-sm font-semibold text-gray-700 truncate max-w-[140px] md:max-w-none">{doc.code}</span>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {batchDone && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700">Conclusão de lote registrada com sucesso!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        {/* Left — viewer + versions */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* Header card */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between border-b border-gray-100 px-4 md:px-5 py-3 md:py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 md:h-11 md:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <FileText size={18} className="text-[#FF201A]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-400">{doc.code}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] md:text-[11px] font-bold text-blue-700">{doc.currentRevision} — VIGENTE</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-semibold capitalize ${statusColor[doc.status]}`}>{doc.status}</span>
                    {doc.isFavorite && <Star size={11} className="text-amber-400 fill-amber-400" />}
                  </div>
                  <h1 className="mt-1 text-sm md:text-base font-semibold text-gray-800 truncate">{doc.title}</h1>
                  <p className="mt-0.5 text-[10px] md:text-xs text-gray-400">{doc.fileType} · {currentVersion?.size} · {doc.pages} pág.</p>
                </div>
              </div>
            </div>

            {/* Viewer */}
            <div className="flex min-h-[220px] md:min-h-[400px] items-center justify-center bg-[#f0f0f0] m-3 md:m-4 rounded-lg">
              <div className="flex flex-col items-center gap-3 text-gray-300 px-4 text-center">
                <svg viewBox="0 0 80 100" className="h-20 w-16 md:h-32 md:w-24 opacity-30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="70" height="90" rx="4" fill="#888" />
                  <rect x="14" y="20" width="52" height="4" rx="2" fill="white" opacity="0.7" />
                  <rect x="14" y="30" width="52" height="4" rx="2" fill="white" opacity="0.7" />
                  <rect x="14" y="40" width="40" height="4" rx="2" fill="white" opacity="0.7" />
                  <rect x="14" y="55" width="52" height="24" rx="2" fill="white" opacity="0.3" />
                  <rect x="14" y="85" width="30" height="4" rx="2" fill="white" opacity="0.5" />
                </svg>
                <p className="text-sm font-medium text-gray-400">Visualizador de Documento</p>
                <p className="text-xs text-gray-300 hidden md:block">{doc.code}_{doc.currentRevision}.{doc.fileType.toLowerCase()} · {doc.pages} páginas</p>
              </div>
            </div>
          </div>

          {/* Actions — mobile */}
          <div className="lg:hidden rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Ações</h2>
            </div>
            <ActionsPanel testIdSuffix="-mobile" />
          </div>

          <div className="lg:hidden">
            <BatchForm />
          </div>

          {/* Version History */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 md:px-5 py-3 md:py-4">
              <GitBranch size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Histórico de Revisões</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {["Revisão", "Enviado por", "Data", "Descrição", "Tam.", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doc.versions.map((v) => (
                    <tr key={v.id} className={`border-b border-gray-50 transition-colors ${v.isCurrent ? "bg-blue-50/30" : "hover:bg-gray-50/60"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-bold ${v.isCurrent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{v.revision}</span>
                          {v.isCurrent && <span className="hidden md:inline text-[10px] font-semibold text-emerald-600">VIGENTE</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{v.uploadedBy}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{v.uploadedAt}</td>
                      <td className="px-4 py-3 max-w-[120px] md:max-w-[200px]"><p className="truncate text-xs text-gray-600">{v.changeDescription}</p></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{v.size}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 ml-auto transition-colors"><Download size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right panel — desktop */}
        <div className="hidden lg:block space-y-4">
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Ações</h2>
            </div>
            <ActionsPanel />
          </div>

          <BatchForm />

          {/* Metadata */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Metadados</h2>
            </div>
            <div className="space-y-3 p-5">
              {[
                { icon: <Hash size={13} />, label: "Código", value: doc.code, mono: true },
                { icon: <FileText size={13} />, label: "Tipo", value: type?.name ?? "-" },
                { icon: <User size={13} />, label: "Correspondente", value: corr?.name ?? "-" },
                { icon: <HardDrive size={13} />, label: "Caminho", value: path?.path ?? "-", mono: true },
                { icon: <Calendar size={13} />, label: "Criado em", value: doc.created },
                { icon: <Hash size={13} />, label: "Páginas", value: String(doc.pages) },
              ].map(({ icon, label, value, mono }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-gray-400">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
                    <p className={`mt-0.5 text-xs font-medium text-gray-700 break-all ${mono ? "font-mono" : ""}`}>{value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <Tag size={13} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
              <Shield size={13} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Integridade</h2>
            </div>
            <div className="space-y-3 p-5">
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
            </div>
          </div>
        </div>
      </div>

      {/* Metadata — mobile */}
      <div className="lg:hidden space-y-3">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Metadados</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
            {[
              { icon: <Hash size={12} />, label: "Código", value: doc.code, mono: true },
              { icon: <FileText size={12} />, label: "Tipo", value: type?.name ?? "-" },
              { icon: <User size={12} />, label: "Correspondente", value: corr?.name ?? "-" },
              { icon: <Calendar size={12} />, label: "Criado em", value: doc.created },
              { icon: <Hash size={12} />, label: "Páginas", value: String(doc.pages) },
            ].map(({ icon, label, value, mono }) => (
              <div key={label} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-gray-400">{icon}</span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-gray-400">{label}</p>
                  <p className={`mt-0.5 text-xs font-medium text-gray-700 truncate ${mono ? "font-mono" : ""}`}>{value}</p>
                </div>
              </div>
            ))}
            <div className="col-span-2 flex items-start gap-2">
              <Tag size={12} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-[9px] uppercase tracking-wide text-gray-400">Tags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
