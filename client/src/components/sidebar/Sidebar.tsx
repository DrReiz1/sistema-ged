import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Upload, History, Users, Settings,
  Tag, Folder, User, AlignLeft, ChevronRight, ChevronLeft, Sliders
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/documents", icon: FileText, label: "Documentos" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/history", icon: History, label: "Histórico" },
  { href: "/groups", icon: Users, label: "Grupos e Usuários" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex h-screen flex-shrink-0 flex-col bg-[#FF201A] shadow-lg z-20"
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        data-testid="button-sidebar-toggle"
        className="absolute -right-3 top-4 z-30 flex h-6 w-6 items-center justify-center rounded-sm bg-[#1c1f2e] text-white shadow-md hover:bg-[#2a2f45] transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation icons */}
      <nav className="flex flex-1 flex-col items-center gap-1 pt-4 pb-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                title={collapsed ? label : undefined}
                className={`group relative flex cursor-pointer items-center gap-3 rounded-lg transition-all duration-150 ${
                  collapsed ? "w-10 h-10 justify-center" : "w-[188px] h-10 px-3"
                } ${isActive ? "bg-white/20" : "hover:bg-white/15"}`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}`}
                />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}`}
                  >
                    {label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile at bottom */}
      <div className="pb-4 flex justify-center">
        <Link href="/profile">
          <div
            className={`flex cursor-pointer items-center gap-3 rounded-lg transition hover:bg-white/15 ${
              collapsed ? "w-10 h-10 justify-center" : "w-[188px] h-10 px-3"
            }`}
            data-testid="nav-profile"
          >
            <User size={20} className="flex-shrink-0 text-white/80" />
            {!collapsed && (
              <span className="text-sm font-medium text-white/80 whitespace-nowrap">Perfil</span>
            )}
          </div>
        </Link>
      </div>
    </motion.aside>
  );
}
