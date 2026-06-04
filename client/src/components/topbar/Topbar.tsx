import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LogOut, Menu } from "lucide-react";
import { apiRequest, queryClient, setAuthToken } from "@/lib/queryClient";
import { getRole, roleConfig } from "@/lib/roles";
import { useConnectivity } from "@/hooks/use-connectivity";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [location, navigate] = useLocation();
  const { isOffline, pendingActions } = useConnectivity();

  const { data: user } = useQuery<{ id: string; username: string; role: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      setAuthToken(null);
      queryClient.clear();
      navigate("/");
    },
  });

  const displayName = user?.username?.split("@")[0] ?? "";
  const role = getRole(user?.role);
  const { label: roleLabel, badgeClass } = roleConfig[role];
  const currentSection = (
    location === "/dashboard" ? "Inicio" :
    location.startsWith("/documents/") ? "Documento aberto" :
    location.startsWith("/documents") ? "Documentos" :
    location.startsWith("/upload") ? "Publicação" :
    location.startsWith("/groups") ? "Usuários" :
    location.startsWith("/history") ? "Histórico" :
    location.startsWith("/settings") ? "Configurações" :
    "Painel"
  );

  return (
    <header className="z-10 mx-3 mt-3 flex h-[72px] flex-shrink-0 items-center justify-between rounded-[16px] border border-black/10 bg-white/95 px-4 shadow-[0px_10px_24px_rgba(0,0,0,0.08)] backdrop-blur md:mx-6 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            data-testid="button-mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-black/10"
          >
            <Menu size={22} />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-end gap-0.5">
            <img src="/figmaAssets/download-2.png" alt="TSEA GED" className="h-6 w-auto object-contain md:h-8" />
            <img src="/figmaAssets/chatgpt-image-1-de-mai--de-2026--12-21-43-1.png" alt="GED" className="mb-[2px] h-4 w-auto object-contain md:h-5" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`hidden rounded-xl px-4 py-2 text-right md:block ${isOffline ? "bg-amber-50" : pendingActions > 0 ? "bg-blue-50" : "bg-gray-50"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Conectividade</p>
          <p className={`mt-1 text-sm font-semibold ${isOffline ? "text-amber-700" : pendingActions > 0 ? "text-blue-700" : "text-gray-800"}`}>
            {isOffline ? "Offline" : pendingActions > 0 ? `${pendingActions} pendencia(s)` : "Online"}
          </p>
        </div>
        <div className="hidden rounded-xl bg-gray-50 px-4 py-2 text-right md:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Seção atual</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">{currentSection}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-2.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-500 md:h-11 md:w-11">
            <svg viewBox="0 0 24 24" fill="white" className="mt-1 h-7 w-7 md:h-8 md:w-8">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize leading-tight text-gray-800">{displayName}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-xs leading-tight text-gray-500">{user?.username}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold sm:hidden ${badgeClass}`}>
            {roleLabel}
          </span>
        </div>

        <button
          onClick={() => logoutMutation.mutate()}
          data-testid="button-logout"
          className="operator-action flex items-center gap-2 rounded-lg border border-[#bf0f0c] bg-[#FF201A] px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e01a14] md:px-5"
        >
          <span className="hidden sm:inline">Sair</span>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
