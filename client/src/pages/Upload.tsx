import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { mockCorrespondents, mockDocumentTypes, mockStoragePaths, mockTags } from "@/mock/data";

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
const MAX_SIZE_MB = 50;

export function Upload() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    code: "", title: "", description: "", correspondent: "",
    docType: "", storagePath: "", date: "", revision: "REV01", changeDescription: "",
  });

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validateFile = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `Extensão não permitida: ${ext}`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Arquivo excede ${MAX_SIZE_MB}MB`;
    return null;
  };

  const addFiles = (incoming: File[]) => {
    const errors: string[] = [];
    const valid: File[] = [];
    incoming.forEach((f) => { const e = validateFile(f); e ? errors.push(`${f.name}: ${e}`) : valid.push(f); });
    setFileErrors(errors);
    setFiles((p) => [...p, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(Array.from(e.target.files)); };
  const removeFile = (i: number) => setFiles((p) => p.filter((_, idx) => idx !== i));
  const toggleTag = (tag: string) => setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;
    setSubmitted(true);
    setTimeout(() => {
      setFiles([]); setSelectedTags([]); setFileErrors([]);
      setForm({ code: "", title: "", description: "", correspondent: "", docType: "", storagePath: "", date: "", revision: "REV01", changeDescription: "" });
      setSubmitted(false);
    }, 3500);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Upload de Documento</h1>

      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 md:px-5 md:py-4">
            <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Documento enviado com sucesso!</p>
              <p className="text-xs text-emerald-600">Revisão {form.revision} em processamento...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative flex min-h-[120px] md:min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            dragging ? "border-[#FF201A] bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        >
          <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={handleFileInput} className="absolute inset-0 cursor-pointer opacity-0" data-testid="input-file" />
          <UploadIcon size={24} className={`mb-2 ${dragging ? "text-[#FF201A]" : "text-gray-300"}`} />
          <p className="text-sm font-medium text-gray-600">Arraste ou toque para selecionar</p>
          <p className="mt-1 text-xs text-gray-400">{ALLOWED_EXTENSIONS.join(", ")} · Max {MAX_SIZE_MB}MB</p>
        </div>

        {fileErrors.map((err, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{err}</p>
          </div>
        ))}

        {files.map((file, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <FileText size={15} className="flex-shrink-0 text-[#FF201A]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
              <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button type="button" onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14} /></button>
          </motion.div>
        ))}

        {/* Form fields */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código do Documento *" value={form.code} onChange={(v) => setField("code", v)} placeholder="Ex: DES-1023" mono testId="input-doc-code" />
            <FormField label="Revisão *" value={form.revision} onChange={(v) => setField("revision", v)} placeholder="REV01" mono testId="input-revision" />
          </div>
          <FormField label="Título do Documento *" value={form.title} onChange={(v) => setField("title", v)} placeholder="Ex: Planta Unifilar Subestação SE-01" testId="input-doc-title" />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Descrição</label>
            <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2}
              placeholder="Descrição do documento..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]" data-testid="input-doc-description" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Tipo de Documento" value={form.docType} onChange={(v) => setField("docType", v)} testId="select-doc-type"
              options={mockDocumentTypes.map((t) => ({ value: String(t.id), label: t.name }))} placeholder="Selecionar tipo..." />
            <SelectField label="Correspondente" value={form.correspondent} onChange={(v) => setField("correspondent", v)} testId="select-correspondent"
              options={mockCorrespondents.map((c) => ({ value: String(c.id), label: c.name }))} placeholder="Selecionar..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Caminho de Armazenamento" value={form.storagePath} onChange={(v) => setField("storagePath", v)} testId="select-storage-path"
              options={mockStoragePaths.map((p) => ({ value: String(p.id), label: p.path }))} placeholder="Selecionar caminho..." mono />
            <FormField label="Data do Documento" value={form.date} onChange={(v) => setField("date", v)} type="date" testId="input-doc-date" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Descrição da Alteração <span className="text-red-500">*</span></label>
            <textarea value={form.changeDescription} onChange={(e) => setField("changeDescription", e.target.value)} rows={2} required
              placeholder="Descreva o que foi alterado nesta revisão..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A]" data-testid="input-change-description" />
          </div>
          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">Etiquetas</label>
            <div className="flex flex-wrap gap-1.5">
              {mockTags.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${selectedTags.includes(tag) ? "bg-[#FF201A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {form.code && form.revision && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 md:px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Nome físico gerado</p>
              <p className="mt-1 font-mono text-xs md:text-sm text-gray-700 break-all">{form.code.toUpperCase()}_{form.revision.toUpperCase()}_<span className="text-gray-400">[uuid]</span>.pdf</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={!files.length}
            className="flex items-center gap-2 rounded-lg bg-[#FF201A] px-5 md:px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e01a14] transition-colors border border-[#bf0f0c] disabled:opacity-40"
            data-testid="button-submit-upload">
            <UploadIcon size={14} /> Publicar {form.revision || "REV01"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, mono, type = "text", testId }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; type?: string; testId?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] ${mono ? "font-mono" : ""}`}
        data-testid={testId} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, mono, testId }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; mono?: boolean; testId?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF201A] ${mono ? "font-mono text-xs" : ""}`}
        data-testid={testId}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
