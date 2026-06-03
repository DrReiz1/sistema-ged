import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, ChevronRight, FileImage, FileText, Upload as UploadIcon, X } from "lucide-react";
import { apiRequest, fetchJson, getAuthToken, queryClient } from "@/lib/queryClient";
import { type ApiCategory, type ApiDocument, type ApiGroup, type ApiTag } from "@/lib/docstation";

const ALLOWED_EXTENSIONS = [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".webp"];
const MAX_SIZE_MB = 20;

function getExtension(fileName: string) {
  return `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
}

function getFileBadge(extension: string) {
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
    return "Imagem";
  }

  if (extension === ".pdf") {
    return "PDF";
  }

  return extension.replace(".", "").toUpperCase();
}

export function Upload() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [submittedDocument, setSubmittedDocument] = useState<ApiDocument | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    categoryId: "",
    groupId: "",
    title: "",
    description: "",
  });

  const { data: categories = [] } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
    queryFn: () => fetchJson<ApiCategory[]>("/api/categories"),
  });

  const { data: tags = [] } = useQuery<ApiTag[]>({
    queryKey: ["/api/tags"],
    queryFn: () => fetchJson<ApiTag[]>("/api/tags"),
  });

  const { data: groups = [] } = useQuery<ApiGroup[]>({
    queryKey: ["/api/groups"],
    queryFn: () => fetchJson<ApiGroup[]>("/api/groups"),
  });

  const { data: documents = [] } = useQuery<ApiDocument[]>({
    queryKey: ["/api/documents"],
    queryFn: () => fetchJson<ApiDocument[]>("/api/documents"),
  });

  const selectedCategory = categories.find((category) => category.id === form.categoryId) ?? null;
  const nextCode = useMemo(() => {
    if (!selectedCategory) {
      return "";
    }

    const lastSequence = documents
      .filter((document) => document.category?.prefix === selectedCategory.prefix)
      .map((document) => Number(document.code.split("-")[1] ?? 0))
      .filter((value) => Number.isFinite(value))
      .sort((left, right) => right - left)[0] ?? 0;

    return `${selectedCategory.prefix}-${String(lastSequence + 1).padStart(3, "0")}`;
  }, [documents, selectedCategory]);

  const validateFile = (candidate: File) => {
    const extension = getExtension(candidate.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Formato não permitido: ${extension}. Use PDF, DWG, DXF, PNG, JPG ou WEBP.`;
    }

    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      return `O arquivo excede o limite de ${MAX_SIZE_MB} MB.`;
    }

    return null;
  };

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Selecione um arquivo antes de publicar.");
      }

      const documentResponse = await apiRequest("POST", "/api/documents", {
        title: form.title,
        description: form.description || undefined,
        categoryId: form.categoryId,
        groupId: form.groupId,
        tags: selectedTags,
      });

      const document = await documentResponse.json() as ApiDocument;
      const formData = new FormData();
      formData.append("file", file);

      const revisionResponse = await fetch(`/api/documents/${document.id}/revisions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken() ?? ""}`,
        },
        body: formData,
      });

      if (!revisionResponse.ok) {
        const message = await revisionResponse.text();
        throw new Error(message || "Não foi possível enviar a primeira revisão do documento.");
      }

      return fetchJson<ApiDocument>(`/api/documents/${document.id}`);
    },
    onSuccess: async (document) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      setSubmittedDocument(document);
      setTimeout(() => navigate(`/documents/${document.id}`), 1200);
    },
  });

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFile = (candidate: File | null) => {
    if (!candidate) {
      return;
    }

    const error = validateFile(candidate);
    if (error) {
      setFileError(error);
      setFile(null);
      return;
    }

    setFileError("");
    setFile(candidate);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((current) => (
      current.includes(tagId)
        ? current.filter((item) => item !== tagId)
        : [...current, tagId]
    ));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    publishMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="operator-surface rounded-[28px] border border-white/70 p-5 md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Publicação guiada</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Publicar documento</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            O sistema gera o código do documento e cria a revisão inicial automaticamente.
          </p>
        </div>
      </section>

      <AnimatePresence>
        {submittedDocument && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="flex-shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Documento publicado com sucesso.</p>
                <p className="mt-0.5 text-xs text-emerald-600">
                  {submittedDocument.code} · {submittedDocument.currentRevision?.revisionNumber ?? "REV01"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { n: 1, label: "Escolher categoria" },
          { n: 2, label: "Enviar arquivo" },
          { n: 3, label: "Confirmar dados" },
        ].map(({ n, label }, index) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step === n ? "bg-[#FF201A] text-white" :
              step > n ? "bg-emerald-500 text-white" :
              "bg-gray-100 text-gray-400"
            }`}>
              {step > n ? "✓" : n}
            </div>
            <span className={`text-sm font-medium ${step === n ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
            {index < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="operator-card rounded-[28px] border border-gray-200 p-5 space-y-4">
            <p className="text-base font-semibold text-gray-800">Qual e a categoria do documento?</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setField("categoryId", category.id)}
                  className={`rounded-[24px] border p-4 text-left transition-all ${
                    form.categoryId === category.id
                      ? "border-[#FF201A] bg-[#FF201A]/5 ring-1 ring-[#FF201A]/30"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={`mb-2 block text-xs font-bold font-mono ${form.categoryId === category.id ? "text-[#FF201A]" : "text-gray-400"}`}>
                    {category.prefix}-XXX
                  </span>
                  <span className={`block text-base font-semibold ${form.categoryId === category.id ? "text-[#FF201A]" : "text-gray-700"}`}>
                    {category.name}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-gray-400">{category.description}</span>
                </button>
              ))}
            </div>

            {selectedCategory && (
              <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Código previsto</p>
                    <p className="mt-1 font-mono text-lg font-bold text-gray-800">{nextCode}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">REV01</span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!form.categoryId}
              onClick={() => setStep(2)}
              className="operator-action h-12 w-full rounded-2xl border border-[#bf0f0c] bg-[#FF201A] text-base font-semibold text-white hover:bg-[#e01a14] disabled:opacity-40"
            >
              Proximo
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="operator-card rounded-[28px] border border-gray-200 p-5 space-y-4">
            <p className="text-base font-semibold text-gray-800">Envie o arquivo da revisão inicial</p>
            <p className="text-sm text-gray-500">Formatos aceitos: PDF, DWG, DXF, PNG, JPG e WEBP · limite de {MAX_SIZE_MB} MB</p>

            {!file ? (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  handleFile(event.dataTransfer.files[0] ?? null);
                }}
                className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed transition-colors ${
                  dragging ? "border-[#FF201A] bg-red-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.webp"
                  onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <UploadIcon size={34} className={`mb-3 ${dragging ? "text-[#FF201A]" : "text-gray-300"}`} />
                <p className="text-base font-semibold text-gray-700">Clique ou arraste o arquivo aqui</p>
                <p className="mt-1 text-sm text-gray-400">Também é possível enviar imagem técnica da operação.</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4">
                {[".png", ".jpg", ".jpeg", ".webp"].includes(getExtension(file.name)) ? (
                  <FileImage size={22} className="flex-shrink-0 text-emerald-600" />
                ) : (
                  <FileText size={22} className="flex-shrink-0 text-emerald-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-800">{file.name}</p>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {getFileBadge(getExtension(file.name))}
                  </p>
                </div>
                <button type="button" onClick={() => setFile(null)} className="rounded-xl p-2 text-gray-400 hover:bg-white hover:text-red-500">
                  <X size={18} />
                </button>
              </div>
            )}

            {fileError && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <AlertCircle size={16} className="flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{fileError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="operator-action h-12 flex-1 rounded-2xl border border-gray-200 text-base font-medium text-gray-600 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={!file}
                onClick={() => setStep(3)}
                className="operator-action h-12 flex-1 rounded-2xl border border-[#bf0f0c] bg-[#FF201A] text-base font-semibold text-white hover:bg-[#e01a14] disabled:opacity-40"
              >
                Proximo
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="operator-card rounded-[28px] border border-gray-200 p-5 space-y-4">
            <p className="text-base font-semibold text-gray-800">Confirme os dados do documento</p>

            <div className="rounded-[24px] border border-gray-100 bg-gray-50 px-4 py-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">Código</p>
                  <p className="mt-1 font-mono text-sm font-bold text-gray-800">{nextCode || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Revisao</p>
                  <p className="mt-1 font-mono text-sm font-bold text-blue-700">REV01</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Arquivo</p>
                  <p className="mt-1 truncate text-sm text-gray-600">{file?.name ?? "-"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Grupo operacional</label>
              <select
                value={form.groupId}
                onChange={(event) => setField("groupId", event.target.value)}
                className="operator-action h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-700 focus:outline-none focus:border-[#FF201A]"
              >
                <option value="">Selecione um grupo</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Titulo do documento</label>
              <input
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="Ex.: Desenho geral do transformador TR-01"
                className="operator-action h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-700 focus:outline-none focus:border-[#FF201A]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Descrição</label>
              <textarea
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                rows={3}
                placeholder="Descreva o conteúdo técnico ou o objetivo deste documento."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-700 focus:outline-none focus:border-[#FF201A] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "bg-[#FF201A] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {publishMutation.isError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {publishMutation.error instanceof Error ? publishMutation.error.message : "Falha ao publicar o documento."}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="operator-action h-12 flex-1 rounded-2xl border border-gray-200 text-base font-medium text-gray-600 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={!form.title || !form.groupId || !file || publishMutation.isPending}
                className="operator-action flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#bf0f0c] bg-[#FF201A] text-base font-semibold text-white hover:bg-[#e01a14] disabled:opacity-40"
              >
                <UploadIcon size={16} />
                {publishMutation.isPending ? "Publicando..." : "Publicar documento"}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
