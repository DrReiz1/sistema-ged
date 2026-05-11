import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Upload,
  History,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/groups", label: "Grupos e Usuários", icon: Users },
  { href: "/settings", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex h-screen flex-shrink-0 flex-col bg-[#1c1f2e] shadow-xl"
    >
      <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <img
              src="/figmaAssets/download--1--1.png"
              alt="TSEA"
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </motion.div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <img
              src="/figmaAssets/download--1--1.png"
              alt="TSEA"
              className="h-6 w-6 object-contain brightness-0 invert"
            />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex h-6 w-6 items-center justify-center rounded text-white/40 transition hover:text-white"
            data-testid="button-sidebar-collapse"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[84px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1c1f2e] text-white/60 shadow-md transition hover:text-white"
          data-testid="button-sidebar-expand"
        >
          <ChevronRight size={12} />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menu
          </p>
        )}
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <motion.a
                whileHover={{ x: collapsed ? 0 : 2 }}
                transition={{ duration: 0.1 }}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FF201A]/20 text-[#FF5955]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                } ${collapsed ? "justify-center px-2" : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? "text-[#FF5955]" : "text-white/50 group-hover:text-white"}`}
                />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF201A]"
                  />
                )}
              </motion.a>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-2 py-3">
        <Link href="/profile">
          <div
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/5 ${collapsed ? "justify-center" : ""}`}
            data-testid="nav-profile"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#FF201A] text-[11px] font-bold text-white">
              AD
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white/80">Admin TSEA</p>
                <p className="truncate text-[10px] text-white/40">admin@tsea.com.br</p>
              </div>
            )}
          </div>
        </Link>
      </div>
    </motion.aside>
  );
}
