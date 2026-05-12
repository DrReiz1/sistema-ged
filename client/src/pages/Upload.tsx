import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileText, X, CheckCircle, Tag, User, Calendar, FolderOpen, Hash, GitBranch, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCorrespondents, mockDocumentTypes, mockStoragePaths, mockTags } from "@/mock/data";

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
const MAX_SIZE_MB = 50;

export function Upload() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [correspondent, setCorrespondent] = useState("");
  const [docType, setDocType] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [docCode, setDocCode] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [docDate, setDocDate] = useState("");
  const [revision, setRevision] = useState("REV01");
  const [changeDescription, setChangeDescription] = useState("");

  const validateFile = (file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `Extensão não permitida: ${ext}`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Tamanho excede ${MAX_SIZE_MB}MB`;
    return null;
  };

  const addFiles = (incoming: File[]) => {
    const errors: string[] = [];
    const valid: File[] = [];
    incoming.forEach((f) => {
      const err = validateFile(f);
      if (err) errors.push(`${f.name}: ${err}`);
      else valid.push(f);
    });
    setFileErrors(errors);
    setFiles((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const toggleTag = (tag: string) => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      setFiles([]); setSelectedTags([]); setCorrespondent(""); setDocType("");
      setStoragePath(""); setDocCode(""); setDocTitle(""); setDocDescription("");
      setDocDate(""); setRevision("REV01"); setChangeDescription("");
      setSubmitted(false);
    }, 3500);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <CheckCircle size={18} className="text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Documento enviado com sucesso!</p>
              <p className="text-xs text-emerald-600">Em processamento... Revisão {revision} será indexada em breve.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 px-5 py-4">
          <CardTitle className="text-sm font-semibold text-gray-700">Enviar Documento — Nova Revisão</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                dragging ? "border-[#FF201A] bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={handleFileInput} className="absolute inset-0 cursor-pointer opacity-0" data-testid="input-file" />
              <UploadIcon size={28} className={`mb-2 transition-colors ${dragging ? "text-[#FF201A]" : "text-gray-300"}`} />
              <p className="text-sm font-medium text-gray-600">Arraste ou clique para selecionar</p>
              <p className="mt-1 text-xs text-gray-400">Aceito: {ALLOWED_EXTENSIONS.join(", ")} · Máximo {MAX_SIZE_MB}MB por arquivo</p>
            </div>

            {/* File errors */}
            {fileErrors.length > 0 && (
              <div className="space-y-1">
                {fileErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                    <AlertCircle size={13} className="text-red-500" />
                    <p className="text-xs text-red-600">{err}</p>
                  </div>
                ))}
              </div>
            )}

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
                    <FileText size={15} className="flex-shrink-0 text-[#FF201A]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Código + Revisão */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><Hash size={11} /> Código do Documento</Label>
                <Input value={docCode} onChange={(e) => setDocCode(e.target.value)} placeholder="Ex: DES-1023" className="h-9 text-sm font-mono" data-testid="input-doc-code" required />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><GitBranch size={11} /> Revisão</Label>
                <Input value={revision} onChange={(e) => setRevision(e.target.value)} placeholder="REV01" className="h-9 text-sm font-mono" data-testid="input-revision" required />
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><FileText size={11} /> Título do Documento</Label>
              <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Ex: Planta Unifilar Subestação SE-01" className="h-9 text-sm" data-testid="input-doc-title" required />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Descrição</Label>
              <textarea
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
                placeholder="Descrição do documento..."
                rows={2}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF201A]/30"
                data-testid="input-doc-description"
              />
            </div>

            {/* Tipo + Correspondente */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><FileText size={11} /> Tipo de Documento</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="h-9 text-sm" data-testid="select-doc-type">
                    <SelectValue placeholder="Selecionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDocumentTypes.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><User size={11} /> Correspondente</Label>
                <Select value={correspondent} onValueChange={setCorrespondent}>
                  <SelectTrigger className="h-9 text-sm" data-testid="select-correspondent">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCorrespondents.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Caminho + Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><FolderOpen size={11} /> Caminho de Armazenamento</Label>
                <Select value={storagePath} onValueChange={setStoragePath}>
                  <SelectTrigger className="h-9 text-sm" data-testid="select-storage-path">
                    <SelectValue placeholder="Selecionar caminho..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStoragePaths.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.path}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><Calendar size={11} /> Data do Documento</Label>
                <Input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} className="h-9 text-sm" data-testid="input-doc-date" />
              </div>
            </div>

            {/* Descrição da alteração (obrigatório) */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <GitBranch size={11} /> Descrição da Alteração <span className="text-red-500">*</span>
              </Label>
              <textarea
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Descreva o que foi alterado nesta revisão..."
                rows={2}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF201A]/30"
                required
                data-testid="input-change-description"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"><Tag size={11} /> Tags</Label>
              <div className="flex flex-wrap gap-2">
                {mockTags.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedTags.includes(tag) ? "bg-[#FF201A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Nome padronizado preview */}
            {docCode && revision && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Nome físico gerado</p>
                <p className="mt-1 font-mono text-sm text-gray-700">
                  {docCode.toUpperCase()}_{revision.toUpperCase()}_<span className="text-gray-400">[uuid]</span>.pdf
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={files.length === 0} className="gap-2 bg-[#FF201A] text-white hover:bg-[#e01a14] disabled:opacity-50" data-testid="button-submit-upload">
                <UploadIcon size={14} /> Publicar Revisão {revision || "REV01"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
