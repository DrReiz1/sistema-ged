import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, User } from "lucide-react";

export function Dashboard() {
  const [, navigate] = useLocation();

  const { data: user } = useQuery<{ id: string; username: string }>({
    queryKey: ["/api/me"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
    },
  });

  return (
    <div className="min-h-screen bg-[#dbd8d3]">
      <header className="border-b border-black/10 bg-[#dcdcdc] shadow-[0px_4px_4px_#00000026]">
        <div className="flex min-h-[101px] items-center justify-between px-[28px] py-5">
          <img
            className="h-auto w-[235px] object-contain"
            alt="TSEA energia"
            src="/figmaAssets/download--1--1.png"
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span data-testid="text-username">{user?.username}</span>
            </div>
            <Button
              data-testid="button-logout"
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-[#bf0f0c] text-[#bf0f0c] hover:bg-[#ff201a] hover:text-white"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut size={14} />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Bem-vindo ao TSEA GED
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerenciamento de Documentos Técnicos
          </p>
        </div>

        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-400 bg-white/60 py-24 text-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <FileText size={48} strokeWidth={1.2} />
            <p className="text-lg font-medium">Nenhum documento cadastrado ainda</p>
            <p className="text-sm">O sistema está pronto. Adicione funcionalidades conforme necessário.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
