import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/topbar/Topbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();

  const { data: user, isLoading } = useQuery<{ id: string; username: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#dbd8d3]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF201A] border-t-transparent" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#dbd8d3]">
      {isMobile ? (
        <>
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setMobileOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar collapsed={false} isMobile onClose={() => setMobileOpen(false)} />
          </div>
        </>
      ) : (
        <div className="relative flex-shrink-0">
          <Sidebar collapsed={collapsed} />
          <button
            onClick={() => setCollapsed((c) => !c)}
            data-testid="button-sidebar-toggle"
            className="absolute -right-3 top-4 z-30 flex h-6 w-6 items-center justify-center rounded-sm bg-[#1c1f2e] text-white shadow-md hover:bg-[#2a2f45] transition-colors"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={isMobile ? () => setMobileOpen(true) : undefined} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
