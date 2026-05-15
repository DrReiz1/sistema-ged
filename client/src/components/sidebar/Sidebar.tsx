import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FileText, Upload, Tag,
  Settings, Palette, Users, ClipboardList, X, BookOpen
} from "lucide-react";
import { type UserRole, roleConfig } from "@/lib/roles";

const allNavItems = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Início" },
  { href: "/documents",  icon: FileText,        label: "Documentos" },
  { href: "/upload",     icon: Upload,          label: "Publicar Documento" },
  { href: "/tags",       icon: Tag,             label: "Etiquetas" },
  { href: "/doc-types",  icon: BookOpen,        label: "Categorias" },
  { href: "/history",    icon: ClipboardList,   label: "Histórico" },
  { href: "/settings",   icon: Settings,        label: "Configurações" },
  { href: "/groups",     icon: Users,           label: "Usuários" },
  { href: "/customize",  icon: Palette,         label: "Aparência" },
];

interface SidebarProps {
  collapsed: boolean;
  role: UserRole;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ collapsed, role, isMobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const allowed = roleConfig[role].allowedRoutes;
  const navItems = allNavItems.filter((item) => allowed.includes(item.href));

  const isActive = (href: string) =>
    location === href || (href !== "/dashboard" && location.startsWith(href));

  const showLabel = isMobile || !collapsed;

  if (isMobile) {
    return (
      <aside className="flex h-full w-72 flex-col bg-[#FF201A] shadow-xl">
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/20">
          <span className="text-white font-bold text-base tracking-wide">Menu</span>
          <button
            onClick={onClose}
            data-testid="button-sidebar-close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 py-4 px-3 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}>
                <div
                  onClick={onClose}
                  data-testid={`nav-${href.replace("/", "")}`}
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-150 ${
                    active ? "bg-white/25" : "hover:bg-white/15"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeBarMobile"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-white"
                    />
                  )}
                  <Icon size={21} className={`flex-shrink-0 ${active ? "text-white" : "text-white/75 group-hover:text-white"}`} />
                  <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 232 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-screen flex-shrink-0 flex-col bg-[#FF201A] shadow-lg z-20 overflow-hidden"
    >
      <nav className="flex flex-1 flex-col items-center gap-1 pt-4 pb-4 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div
                data-testid={`nav-${href.replace("/", "")}`}
                title={collapsed ? label : undefined}
                className={`group relative flex cursor-pointer items-center gap-3 rounded-xl transition-all duration-150 ${
                  collapsed ? "w-11 h-11 justify-center" : "w-[208px] h-11 px-4"
                } ${active ? "bg-white/25" : "hover:bg-white/15"}`}
              >
                {active && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-white"
                  />
                )}
                <Icon size={20} className={`flex-shrink-0 transition-colors ${active ? "text-white" : "text-white/75 group-hover:text-white"}`} />
                {showLabel && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    className={`text-sm font-medium whitespace-nowrap leading-tight ${active ? "text-white" : "text-white/80 group-hover:text-white"}`}
                  >
                    {label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
