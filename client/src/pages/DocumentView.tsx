import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CheckSquare,
  Download,
  FileImage,
  FileText,
  GitBranch,
  Hash,
  Shield,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { apiRequest, buildAuthenticatedUrl, fetchJson, getAuthToken, queryClient } from "@/lib/queryClient";
import { type ApiDocument, type ApiRevision, formatDate, mapStatusClass, mapStatusLabel } from "@/lib/docstation";
import { getRole, roleConfig } from "@/lib/roles";

const ALLOWED_EXTENSIONS = [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".webp"];
const MAX_SIZE_MB = 20;
const INLINE_IMAGE_TYPES = new Set(["png", "jpg", "jpeg", "webp"]);

function validateRevisionFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Envie apenas arquivos PDF, DWG, DXF, PNG, JPG ou WEBP.";
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `O arquivo excede o limite de ${MAX_SIZE_MB} MB.`;
  }

  return null;
}

function buildDownloadName(doc: ApiDocument, revision?: ApiRevision | null) {
  return revision?.originalFileName
    ?? `${doc.code}_${revision?.revisionNumber ?? doc.currentRevision?.revisionNumber ?? "REV00"}.${revision?.fileType ?? doc.currentRevision?.fileType ?? "pdf"}`;
}

export function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [batchDone, setBatchDone] = useState(false);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [revisionError, setRevisionError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloadingRevisionId, setDownloadingRevisionId] = useState<string | null>(null);

  const { data: user } = useQuery<{ id: string; username: string; role: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });
  const role = getRole(user?.role);
  const perms = roleConfig[role];

  const { data: doc, isLoading } = useQuery<ApiDocument>({
    queryKey: ["/api/documents", id],
    queryFn: () => fetchJson<ApiDocument>(`/api/documents/${id}`),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/documents/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      navigate("/documents");
    },
  });

  const publishRevisionMutation = useMutation({
    mutationFn: async () => {
      if (!revisionFile) {
        throw new Error("Selecione um arquivo para publicar a nova revisão.");
      }

      const error = validateRevisionFile(revisionFile);
      if (error) {
        throw new Error(error);
      }

      const formData = new FormData();
      formData.append("file", revisionFile);

      const response = await fetch(`/api/documents/${id}/revisions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken() ?? ""}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Não foi possível publicar a nova revisão.");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/documents", id] });
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      setRevisionFile(null);
      setRevisionError("");
      setShowRevisionForm(false);
    },
  });

  if (isLoading) {
    return <div className="py-24 text-center text-gray-400">Carregando documento...</div>;
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FileText size={48} strokeWidth={1} />
        <p className="mt-4 text-lg">Documento não encontrado.</p>
        <button
          className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          onClick={() => navigate("/documents")}
        >
          Voltar
        </button>
      </div>
    );
  }

  const currentVersion = doc.currentRevision;
  const previewUrl = buildAuthenticatedUrl(`/api/documents/${doc.id}/preview`);
  const currentDownloadUrl = buildAuthenticatedUrl(`/api/documents/${doc.id}/download`);
  const currentFileType = currentVersion?.fileType?.toLowerCase() ?? "";
  const canPreviewPdf = currentFileType === "pdf";
  const canPreviewImage = INLINE_IMAGE_TYPES.has(currentFileType);

  const handleBatchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void apiRequest("POST", "/api/logs", {
      action: "conclusao_lote",
      documentId: doc.id,
      revisionId: doc.currentRevisionId,
    }).then(async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      setBatchDone(true);
      setShowBatchForm(false);
      setBatchCode("");
      setBatchNotes("");
      setTimeout(() => setBatchDone(false), 4000);
    });
  };

  const handleDownload = async (revision?: ApiRevision) => {
    const url = revision
      ? buildAuthenticatedUrl(`/api/documents/${doc.id}/download?revisionId=${revision.id}`)
      : currentDownloadUrl;
    const targetRevisionId = revision?.id ?? doc.currentRevisionId ?? "current";

    try {
      setDownloadError("");
      setDownloadingRevisionId(targetRevisionId);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken() ?? ""}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Não foi possível baixar o documento.");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = buildDownloadName(doc, revision ?? currentVersion);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Não foi possível baixar o documento.");
    } finally {
      setDownloadingRevisionId(null);
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Excluir o documento ${doc.code}? Essa ação remove o documento e todas as revisões salvas nesta demonstração.`);
    if (!confirmed) {
      return;
    }

    deleteDocumentMutation.mutate();
  };

  const handleRevisionFile = (file: File | null) => {
    if (!file) {
      return;
    }

    const error = validateRevisionFile(file);
    if (error) {
      setRevisionError(error);
      setRevisionFile(null);
      return;
    }

    setRevisionFile(file);
    setRevisionError("");
  };

  const ActionsPanel = ({ testIdSuffix = "" }: { testIdSuffix?: string }) => (
    <div className="flex flex-col gap-2 p-4">
      <button
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e01a14]"
        data-testid={`button-download${testIdSuffix}`}
        onClick={() => void handleDownload()}
      >
        <Download size={14} />
        {downloadingRevisionId === (doc.currentRevisionId ?? "current") ? "Baixando..." : "Baixar versão vigente"}
      </button>

      {downloadError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {downloadError}
        </div>
      )}

      {perms.canBatchCompletion && (
        <button
          onClick={() => setShowBatchForm((value) => !value)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          data-testid={`button-batch-completion${testIdSuffix}`}
        >
          <CheckSquare size={14} /> Registrar conclusão de lote
        </button>
      )}

      {perms.canPublishRevision && (
        <button
          onClick={() => setShowRevisionForm((value) => !value)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          <Upload size={14} /> Publicar nova revisão
        </button>
      )}

      {perms.canDelete && (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
          onClick={handleDelete}
          disabled={deleteDocumentMutation.isPending}
        >
          <Trash2 size={14} /> {deleteDocumentMutation.isPending ? "Excluindo..." : "Excluir documento"}
        </button>
      )}
    </div>
  );

  const BatchForm = () => (
    <AnimatePresence>
      {showBatchForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm"
        >
          <div className="border-b border-emerald-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-emerald-700">Conclusão de lote / operação</h2>
          </div>
          <form onSubmit={handleBatchSubmit} className="space-y-3 p-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Código do lote / OS</label>
              <input
                value={batchCode}
                onChange={(event) => setBatchCode(event.target.value)}
                placeholder="Ex.: LOTE-2026-001"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-emerald-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Observações</label>
              <textarea
                value={batchNotes}
                onChange={(event) => setBatchNotes(event.target.value)}
                rows={3}
                placeholder="Descreva a atividade realizada..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <CheckCircle size={13} /> Confirmar conclusão
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const RevisionForm = () => (
    <AnimatePresence>
      {showRevisionForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/40 shadow-sm"
        >
          <div className="border-b border-blue-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-blue-700">Nova revisão do documento</h2>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs text-gray-500">
              A próxima revisão será criada automaticamente a partir do arquivo enviado.
            </p>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-blue-300 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">{revisionFile?.name ?? "Selecionar arquivo"}</p>
                <p className="text-xs text-gray-400">Aceita PDF, DWG, DXF, PNG, JPG e WEBP</p>
              </div>
              <Upload size={16} className="text-blue-600" />
              <input
                type="file"
                accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(event) => handleRevisionFile(event.target.files?.[0] ?? null)}
              />
            </label>

            {revisionError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={15} className="flex-shrink-0" />
                {revisionError}
              </div>
            )}

            {publishRevisionMutation.isError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={15} className="flex-shrink-0" />
                {publishRevisionMutation.error instanceof Error ? publishRevisionMutation.error.message : "Falha ao publicar a revisão."}
              </div>
            )}

            <button
              type="button"
              onClick={() => publishRevisionMutation.mutate()}
              disabled={!revisionFile || publishRevisionMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload size={13} />
              {publishRevisionMutation.isPending ? "Publicando..." : "Publicar revisão"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => navigate("/documents")}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 md:px-3 md:text-sm"
        >
          <ArrowLeft size={13} /> Documentos
        </button>
        <span className="text-gray-300">/</span>
        <span className="max-w-[140px] truncate text-xs font-semibold text-gray-700 md:max-w-none md:text-sm">{doc.code}</span>
      </div>

      <AnimatePresence>
        {batchDone && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
          >
            <CheckCircle size={16} className="flex-shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">Conclusão de lote registrada com sucesso.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        <div className="space-y-3 md:space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-start justify-between border-b border-gray-100 px-4 py-3 md:px-5 md:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 md:h-11 md:w-11">
                  {canPreviewImage ? <FileImage size={18} className="text-[#FF201A]" /> : <FileText size={18} className="text-[#FF201A]" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400">{doc.code}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 md:text-[11px]">
                      {doc.currentRevision?.revisionNumber ?? "SEM REV"} · VIGENTE
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize md:text-[11px] ${mapStatusClass(doc.status)}`}>
                      {mapStatusLabel(doc.status)}
                    </span>
                  </div>
                  <h1 className="mt-1 truncate text-sm font-semibold text-gray-800 md:text-base">{doc.title}</h1>
                  <p className="mt-0.5 text-[10px] text-gray-400 md:text-xs">
                    {(currentVersion?.fileType?.toUpperCase() ?? "SEM ARQUIVO")} · {doc.revisions.length} revisão(ões)
                  </p>
                </div>
              </div>
            </div>

            <div className="m-3 md:m-4">
              {canPreviewPdf ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <object
                    data={previewUrl}
                    type="application/pdf"
                    className="h-[420px] w-full bg-white"
                    aria-label={`Prévia do documento ${doc.code}`}
                  >
                    <div className="flex h-[420px] flex-col items-center justify-center px-6 text-center">
                      <FileText size={34} className="text-gray-300" />
                      <p className="mt-4 text-sm font-medium text-gray-700">A prévia do PDF não abriu neste navegador.</p>
                      <p className="mt-1 max-w-md text-xs text-gray-500">
                        O arquivo continua disponível para download e abertura externa.
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleDownload()}
                        className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Baixar PDF
                      </button>
                    </div>
                  </object>
                </div>
              ) : canPreviewImage ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <img
                    src={previewUrl}
                    alt={`Prévia do documento ${doc.code}`}
                    className="max-h-[520px] w-full object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                  <FileText size={34} className="text-gray-300" />
                  <p className="mt-4 text-sm font-medium text-gray-700">Prévia indisponível para arquivos {currentVersion?.fileType?.toUpperCase()}.</p>
                  <p className="mt-1 max-w-md text-xs text-gray-500">
                    O download continua disponível normalmente. A prévia inline foi mantida para PDF e imagem.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleDownload()}
                    className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Baixar arquivo atual
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-400">{buildDownloadName(doc, currentVersion)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Ações</h2>
            </div>
            <ActionsPanel testIdSuffix="-mobile" />
          </div>

          <div className="lg:hidden">
            <RevisionForm />
          </div>

          <div className="lg:hidden">
            <BatchForm />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 md:px-5 md:py-4">
              <GitBranch size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Histórico de revisões</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {["Revisão", "Enviado por", "Data", "Arquivo", "Tipo", ""].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doc.revisions.map((revision) => {
                    const isCurrent = revision.id === doc.currentRevisionId;

                    return (
                      <tr key={revision.id} className={`border-b border-gray-50 transition-colors ${isCurrent ? "bg-blue-50/30" : "hover:bg-gray-50/60"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold md:text-[11px] ${isCurrent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                              {revision.revisionNumber}
                            </span>
                            {isCurrent && <span className="hidden text-[10px] font-semibold text-emerald-600 md:inline">VIGENTE</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{revision.uploadedByName ?? revision.uploadedBy}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{formatDate(revision.createdAt)}</td>
                        <td className="max-w-[160px] px-4 py-3">
                          <p className="truncate text-xs text-gray-600">{revision.originalFileName ?? revision.fileUrl}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{revision.fileType.toUpperCase()}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="ml-auto flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            onClick={() => void handleDownload(revision)}
                          >
                            <Download size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="hidden space-y-4 lg:block">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Ações</h2>
            </div>
            <ActionsPanel />
          </div>

          <RevisionForm />
          <BatchForm />

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Metadados</h2>
            </div>
            <div className="space-y-3 p-5">
              {[
                { icon: <Hash size={13} />, label: "Código", value: doc.code, mono: true },
                { icon: <FileText size={13} />, label: "Categoria", value: doc.category?.name ?? "-" },
                { icon: <Calendar size={13} />, label: "Criado em", value: formatDate(doc.createdAt) },
                { icon: <Hash size={13} />, label: "Grupo operacional", value: doc.group?.name ?? "-" },
              ].map(({ icon, label, value, mono }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-gray-400">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
                    <p className={`mt-0.5 break-all text-xs font-medium text-gray-700 ${mono ? "font-mono" : ""}`}>{value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <Tag size={13} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <span key={tag.id} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
              <Shield size={13} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Controle técnico</h2>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Identificador da revisão</p>
                <p className="mt-1 break-all font-mono text-[11px] text-gray-500">{currentVersion?.id ?? "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Arquivo vigente</p>
                <p className="mt-1 break-all font-mono text-[11px] text-gray-500">{currentVersion?.originalFileName ?? currentVersion?.fileUrl ?? "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Publicada em</p>
                <p className="mt-1 text-xs text-gray-600">
                  {currentVersion?.uploadedByName ?? currentVersion?.uploadedBy ?? "-"} · {formatDate(currentVersion?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
