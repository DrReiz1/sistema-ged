import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function Topbar() {
  const [, navigate] = useLocation();

  const { data: user } = useQuery<{ id: string; username: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
    },
  });

  const displayName = user?.username?.split("@")[0] ?? "Marcos";

  return (
    <header className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-black/10 bg-[#dcdcdc] px-6 shadow-[0px_4px_4px_#00000026] z-10">
      {/* Logo */}
      <div className="flex items-center gap-1">
        <img src="/figmaAssets/download--1--1.png" alt="TSEA" className="h-10 w-auto object-contain" />
        <img src="/figmaAssets/download-2.png" alt="GED" className="h-7 w-auto object-contain" />
        <img src="/figmaAssets/chatgpt-image-1-de-mai--de-2026--12-21-43-1.png" alt="GED" className="h-5 w-auto object-contain" />
      </div>

      {/* Right: avatar + name + sair */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-500 overflow-hidden">
            <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8 mt-1">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight capitalize">{displayName}</p>
            <p className="text-xs text-gray-500 leading-tight">Supervisor</p>
          </div>
        </div>

        <button
          onClick={() => logoutMutation.mutate()}
          data-testid="button-logout"
          className="flex items-center gap-1.5 rounded px-4 py-2 bg-[#FF201A] text-white text-sm font-semibold hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
        >
          Sair <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
