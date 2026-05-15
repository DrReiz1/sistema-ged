import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { mockDocumentTypes, mockTags } from "@/mock/data";

const ALLOWED_EXTENSIONS = [".pdf", ".dwg", ".dxf"];
const MAX_SIZE_MB = 100;

function getNextCode(prefix: string): string {
  const counts: Record<string, number> = { DES: 1, PRO: 5, ITP: 2, CHK: 2, LAU: 2, ART: 2, CER: 3, CON: 2 };
  const n = (counts[prefix] ?? 0) + 1;
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

export function Upload() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    docType: "",
    title: "",
    description: "",
  });

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const selectedType = mockDocumentTypes.find((t) => String(t.id) === form.docType);
  const autoCode = selectedType ? getNextCode(selectedType.prefix) : "";
  const autoRevision = "REV01";

  const validateFile = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `Formato não permitido: ${ext}. Use PDF, DWG ou DXF.`;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `Arquivo excede ${MAX_SIZE_MB}MB`;
    return null;
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    const err = validateFile(f);
    if (err) { setFileError(err); setFile(null); } else { setFileError(""); setFile(f); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const err = validateFile(f);
    if (err) { setFileError(err); setFile(null); } else { setFileError(""); setFile(f); }
  };

  const toggleTag = (tag: string) =>
    setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFile(null); setSelectedTags([]); setFileError(""); setStep(1);
      setForm({ docType: "", title: "", description: "" });
      setSubmitted(false);
    }, 3500);
  };

  const canGoStep2 = !!form.docType;
  const canGoStep3 = !!file;
  const canSubmit  = !!form.title && !!file;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Publicar Documento</h1>
        <p className="text-sm text-gray-400 mt-1">O sistema gera o código e a revisão automaticamente.</p>
      </div>

      {/* Success */}
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Documento publicado com sucesso!</p>
              <p className="text-xs text-emerald-600 mt-0.5">{autoCode} · {autoRevision} em processamento...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Categoria" },
          { n: 2, label: "Arquivo" },
          { n: 3, label: "Detalhes" },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step === n ? "bg-[#FF201A] text-white" :
              step > n  ? "bg-emerald-500 text-white" :
              "bg-gray-100 text-gray-400"
            }`}>{step > n ? "✓" : n}</div>
            <span className={`text-sm font-medium ${step === n ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
            {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* STEP 1 — Categoria */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Qual é a categoria deste documento?</p>
            <div className="grid grid-cols-2 gap-3">
              {mockDocumentTypes.map((t) => (
                <button key={t.id} type="button" onClick={() => setField("docType", String(t.id))}
                  data-testid={`type-${t.id}`}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    form.docType === String(t.id)
                      ? "border-[#FF201A] bg-[#FF201A]/5 ring-1 ring-[#FF201A]/30"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                  <span className={`text-xs font-bold font-mono mb-1 ${form.docType === String(t.id) ? "text-[#FF201A]" : "text-gray-400"}`}>{t.prefix}-XXX</span>
                  <span className={`text-sm font-semibold ${form.docType === String(t.id) ? "text-[#FF201A]" : "text-gray-700"}`}>{t.name}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5 leading-tight">{t.description}</span>
                </button>
              ))}
            </div>
            {form.docType && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Código gerado automaticamente</p>
                  <p className="font-mono font-bold text-base text-gray-800 mt-0.5">{autoCode}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{autoRevision}</span>
              </div>
            )}
            <button type="button" disabled={!canGoStep2} onClick={() => setStep(2)}
              className="w-full h-12 rounded-xl bg-[#FF201A] text-white font-semibold text-sm hover:bg-[#e01a14] transition-colors border border-[#bf0f0c] disabled:opacity-40">
              Próximo →
            </button>
          </motion.div>
        )}

        {/* STEP 2 — Arquivo */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Envie o arquivo do documento</p>
            <p className="text-xs text-gray-400">Formatos aceitos: <strong>PDF, DWG, DXF</strong> · Máx. {MAX_SIZE_MB}MB</p>

            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                  dragging ? "border-[#FF201A] bg-red-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
              >
                <input type="file" accept=".pdf,.dwg,.dxf" onChange={handleFileInput} className="absolute inset-0 cursor-pointer opacity-0" data-testid="input-file" />
                <UploadIcon size={32} className={`mb-3 ${dragging ? "text-[#FF201A]" : "text-gray-300"}`} />
                <p className="text-sm font-medium text-gray-600">Toque ou arraste para selecionar</p>
                <p className="mt-1 text-xs text-gray-400">PDF, DWG ou DXF</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <FileText size={20} className="flex-shrink-0 text-emerald-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
              </div>
            )}

            {fileError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{fileError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
                ← Voltar
              </button>
              <button type="button" disabled={!canGoStep3} onClick={() => setStep(3)}
                className="flex-1 h-12 rounded-xl bg-[#FF201A] text-white font-semibold text-sm hover:bg-[#e01a14] transition-colors border border-[#bf0f0c] disabled:opacity-40">
                Próximo →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Detalhes */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Informe os detalhes do documento</p>

            {/* Resumo */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-4">
              <div>
                <p className="text-[11px] text-gray-400">Código</p>
                <p className="font-mono font-bold text-sm text-gray-800">{autoCode}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Revisão</p>
                <p className="font-mono font-bold text-sm text-blue-700">{autoRevision}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400">Arquivo</p>
                <p className="text-xs text-gray-600 truncate">{file?.name}</p>
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Título do documento <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} required
                placeholder="Ex: Planta Unifilar Subestação SE-01"
                className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]"
                data-testid="input-doc-title" />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Descrição <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3}
                placeholder="Descreva o conteúdo ou objetivo deste documento..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] resize-none"
                data-testid="input-doc-description" />
            </div>

            {/* Etiquetas */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Etiquetas <span className="text-gray-400 font-normal">(opcional)</span></label>
              <div className="flex flex-wrap gap-2">
                {mockTags.slice(0, 16).map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedTags.includes(tag) ? "bg-[#FF201A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
                ← Voltar
              </button>
              <button type="submit" disabled={!canSubmit}
                className="flex-1 h-12 rounded-xl bg-[#FF201A] text-white font-semibold text-sm hover:bg-[#e01a14] transition-colors border border-[#bf0f0c] disabled:opacity-40 flex items-center justify-center gap-2"
                data-testid="button-submit-upload">
                <UploadIcon size={16} /> Publicar Documento
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
