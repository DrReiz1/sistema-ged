import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, CreditCard, History, Settings as SettingsIcon, ShieldCheck } from "lucide-react";

const sections = [
  { id: "geral", label: "Geral", icon: SettingsIcon },
  { id: "operacao", label: "Operacao", icon: Activity },
  { id: "integracao", label: "App e NFC", icon: CreditCard },
];

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div className="operator-action flex h-12 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-700">
        {value}
      </div>
    </div>
  );
}

function StatusCard({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className={`text-sm font-bold ${accent}`}>{title}</p>
      <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
    </div>
  );
}

export function Settings() {
  const [activeSection, setActiveSection] = useState("geral");

  return (
    <div className="mx-auto max-w-6xl space-y-6 md:flex md:gap-6 md:space-y-0">
      <aside className="md:w-64 md:flex-shrink-0">
        <div className="operator-card rounded-[18px] border border-gray-200 p-3">
          <div className="mb-3 px-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Configuracoes</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Ajustes</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                data-testid={`settings-nav-${id}`}
                className={`operator-action flex min-h-[56px] items-center gap-3 rounded-xl px-4 text-left text-sm transition-colors ${
                  activeSection === id ? "bg-[#FF201A]/10 font-semibold text-[#FF201A]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <motion.div key={activeSection} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="min-w-0 flex-1">
        {activeSection === "geral" && (
          <div className="operator-card rounded-[18px] border border-gray-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Geral</h2>
              <p className="mt-1 text-sm text-gray-500">Informacoes principais do ambiente em uso.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoField label="Idioma" value="Portugues (Brasil)" />
              <InfoField label="Fuso horario" value="America/Sao_Paulo (UTC-3)" />
              <InfoField label="Limite de upload" value="100 MB por arquivo" />
              <InfoField label="Expiracao de sessao" value="8 horas" />
            </div>
            <div className="mt-5 rounded-[16px] border border-gray-200 bg-[#fff4f3] p-4">
              <p className="text-sm font-semibold text-gray-800">Uso recomendado</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Esta area mostra apenas parametros operacionais reais do GED. Funcoes redundantes ou que nao existem no ambiente atual foram removidas para evitar configuracoes sem efeito.
              </p>
            </div>
          </div>
        )}

        {activeSection === "operacao" && (
          <div className="operator-card rounded-[18px] border border-gray-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Operacao</h2>
              <p className="mt-1 text-sm text-gray-500">Resumo do comportamento atual do GED no uso diario.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatusCard
                title="Controle de revisao"
                accent="text-[#FF201A]"
                description="Cada publicacao gera uma nova revisao e preserva o historico do documento sem substituir versoes anteriores."
              />
              <StatusCard
                title="Rastreabilidade"
                accent="text-cyan-700"
                description="O historico registra acoes do GED e do app, incluindo operador, origem da acao e horario de execucao."
              />
              <StatusCard
                title="Contingencia"
                accent="text-emerald-700"
                description="O sistema mantem suporte a consulta resiliente e a registros leves em cenarios de instabilidade de conexao."
              />
            </div>
          </div>
        )}

        {activeSection === "integracao" && (
          <div className="operator-card rounded-[18px] border border-gray-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-800">App e NFC</h2>
              <p className="mt-1 text-sm text-gray-500">Pontos relevantes para a operacao integrada com o aplicativo.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatusCard
                title="Leitura por cracha"
                accent="text-cyan-700"
                description="O acesso do app depende de codigo NFC valido, funcionario ativo e permissao vigente para as categorias liberadas."
              />
              <StatusCard
                title="Cartao mestre"
                accent="text-amber-700"
                description="O cartao mestre continua com acesso total aos documentos publicados no ambiente integrado."
              />
              <StatusCard
                title="Seguranca operacional"
                accent="text-slate-700"
                description="A configuracao do app e do NFC fica centralizada na tela de Usuarios, evitando ajustes duplicados nesta area."
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[16px] border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-emerald-700" />
                  <p className="text-sm font-semibold text-gray-800">Permissoes do app</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  O GED atual controla o acesso do app por categoria liberada para cada operador.
                </p>
              </div>
              <div className="rounded-[16px] border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-cyan-700" />
                  <p className="text-sm font-semibold text-gray-800">Auditoria integrada</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Entradas, consultas e demais acoes do app podem ser acompanhadas na tela de Historico junto com os eventos do GED.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
