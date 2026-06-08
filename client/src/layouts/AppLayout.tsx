import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/topbar/Topbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { getRole, roleConfig } from "@/lib/roles";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();

  const { data: user, isLoading } = useQuery<{ id: string; username: string; role: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });

  const role = getRole(user?.role);
  const allowed = roleConfig[role].allowedRoutes;

  useEffect(() => {
    const storedSidebar = window.localStorage.getItem("docstation:sidebar-collapsed");
    const storedDensity = window.localStorage.getItem("docstation:ui-density");

    if (storedSidebar === "true" || storedSidebar === "false") {
      setCollapsed(storedSidebar === "true");
    }

    if (storedDensity === "compact" || storedDensity === "normal" || storedDensity === "relaxed") {
      document.documentElement.dataset.uiDensity = storedDensity;
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [isLoading, user, navigate]);

  // Redirect if the current route is not allowed for this role
  useEffect(() => {
    if (!isLoading && user) {
      const base = "/" + location.split("/")[1];
      if (!allowed.includes(base)) {
        navigate("/dashboard");
      }
    }
  }, [isLoading, user, location, allowed, navigate]);

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
    <div className="flex h-screen overflow-hidden bg-[var(--surface-bg)]">
      {isMobile ? (
        <>
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar collapsed={false} role={role} isMobile onClose={() => setMobileOpen(false)} />
          </div>
        </>
      ) : (
        <div className="relative flex-shrink-0 pl-3 pb-3 pt-3">
          <Sidebar collapsed={collapsed} role={role} />
          <button
            onClick={() => setCollapsed((c) => !c)}
            data-testid="button-sidebar-toggle"
            className="absolute -right-1 top-8 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-[#1c1f2e] text-white shadow-lg transition-colors hover:bg-[#2a2f45]"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={isMobile ? () => setMobileOpen(true) : undefined} />
        <main className="operator-scrollbar flex-1 overflow-y-auto px-3 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
