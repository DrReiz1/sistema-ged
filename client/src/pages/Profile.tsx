import { motion } from "framer-motion";
import { User, Mail, Shield, Clock, Edit3, Save, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function Profile() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF201A] text-3xl font-bold text-white shadow-md">
                AD
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Administrador TSEA</h2>
                <p className="text-sm text-gray-500">admin@tsea.com.br</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="flex items-center gap-1 bg-purple-100 text-[11px] font-semibold text-purple-700">
                    <Shield size={10} /> Administrador
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1 bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                    Ativo
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-sm">
                <Edit3 size={13} /> Editar foto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 px-5 py-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <User size={11} /> Nome
                </Label>
                <Input defaultValue="Administrador TSEA" className="h-9 text-sm" data-testid="input-profile-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <Mail size={11} /> E-mail
                </Label>
                <Input defaultValue="admin@tsea.com.br" className="h-9 text-sm" data-testid="input-profile-email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Cargo</Label>
                <Input defaultValue="Administrador do Sistema" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Departamento</Label>
                <Input defaultValue="TI / Administradores" className="h-9 text-sm" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2 bg-[#FF201A] text-sm text-white hover:bg-[#e01a14]" size="sm" data-testid="button-save-profile">
                <Save size={13} /> Salvar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 px-5 py-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <Key size={11} /> Senha atual
              </Label>
              <Input type="password" className="h-9 text-sm" data-testid="input-current-password" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Nova senha</Label>
                <Input type="password" className="h-9 text-sm" data-testid="input-new-password" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Confirmar senha</Label>
                <Input type="password" className="h-9 text-sm" data-testid="input-confirm-password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2 text-sm" size="sm" data-testid="button-change-password">
                <Key size={13} /> Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 px-5 py-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {[
                { action: "Login realizado", date: "Hoje, 14:32", icon: "🔐" },
                { action: "Upload: Contrato de Manutenção SE-01", date: "Hoje, 14:35", icon: "📄" },
                { action: "Download: NR-10 Certificado Treinamento", date: "Ontem, 10:22", icon: "⬇️" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-base">{item.icon}</span>
                  <div className="flex-1 text-gray-700">{item.action}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
