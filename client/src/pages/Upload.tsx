import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileText, X, CheckCircle, Tag, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCorrespondents, mockTags } from "@/mock/data";

export function Upload() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [correspondent, setCorrespondent] = useState("");
  const [docDate, setDocDate] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      setFiles([]);
      setSelectedTags([]);
      setCorrespondent("");
      setDocDate("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <CheckCircle size={18} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">Documento enviado com sucesso! Em processamento...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 px-5 py-4">
          <CardTitle className="text-sm font-semibold text-gray-700">Enviar Documento</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                dragging ? "border-[#FF201A] bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100/50"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.dwg,.xls,.xlsx"
                onChange={handleFileInput}
                className="absolute inset-0 cursor-pointer opacity-0"
                data-testid="input-file"
              />
              <UploadIcon size={32} className={`mb-3 transition-colors ${dragging ? "text-[#FF201A]" : "text-gray-300"}`} />
              <p className="text-sm font-medium text-gray-600">Arraste arquivos ou clique para selecionar</p>
              <p className="mt-1 text-xs text-gray-400">PDF, DOC, DOCX, DWG, XLS · Até 100 MB por arquivo</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5"
                  >
                    <FileText size={16} className="flex-shrink-0 text-[#FF201A]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <User size={12} /> Correspondente
                </Label>
                <Select value={correspondent} onValueChange={setCorrespondent}>
                  <SelectTrigger className="h-9 text-sm" data-testid="select-upload-correspondent">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCorrespondents.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <Calendar size={12} /> Data do Documento
                </Label>
                <Input
                  type="date"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="h-9 text-sm"
                  data-testid="input-doc-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <Tag size={12} /> Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {mockTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-[#FF201A] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={files.length === 0}
                className="gap-2 bg-[#FF201A] text-white hover:bg-[#e01a14] disabled:opacity-50"
                data-testid="button-submit-upload"
              >
                <UploadIcon size={14} /> Enviar Documento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
