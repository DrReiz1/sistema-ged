import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LogOut, Menu } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getRole, roleConfig } from "@/lib/roles";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [, navigate] = useLocation();

  const { data: user } = useQuery<{ id: string; username: string; role: string } | null>({
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

  const displayName = user?.username?.split("@")[0] ?? "";
  const role = getRole(user?.role);
  const { label: roleLabel, badgeClass } = roleConfig[role];

  return (
    <header className="flex h-14 md:h-[72px] flex-shrink-0 items-center justify-between border-b border-black/10 bg-[#dcdcdc] px-3 md:px-6 shadow-[0px_4px_4px_#00000026] z-10">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            data-testid="button-mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-black/10 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex items-end gap-0.5">
          <img src="/figmaAssets/download-2.png" alt="TSEA GED" className="h-6 md:h-8 w-auto object-contain" />
          <img src="/figmaAssets/chatgpt-image-1-de-mai--de-2026--12-21-43-1.png" alt="GED" className="h-4 md:h-5 w-auto object-contain mb-[2px]" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 md:gap-2.5">
          <div className="flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-500 overflow-hidden">
            <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7 md:h-8 md:w-8 mt-1">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800 leading-tight capitalize">{displayName}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-tight">{user?.username}</p>
          </div>
          {/* Mobile: role badge only */}
          <span className={`sm:hidden rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
            {roleLabel}
          </span>
        </div>

        <button
          onClick={() => logoutMutation.mutate()}
          data-testid="button-logout"
          className="flex items-center gap-1.5 rounded px-2.5 md:px-4 py-2 bg-[#FF201A] text-white text-sm font-semibold hover:bg-[#e01a14] transition-colors border border-[#bf0f0c]"
        >
          <span className="hidden sm:inline">Sair</span>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
