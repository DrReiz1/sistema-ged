import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Home, User, Tag, Folder, FileText,
  Settings, SlidersHorizontal, Users, AlignLeft, X, Upload
} from "lucide-react";
import { type UserRole, roleConfig } from "@/lib/roles";

const allNavItems = [
  { href: "/dashboard",      icon: LayoutDashboard,   label: "Início" },
  { href: "/documents",      icon: Home,              label: "Documentos" },
  { href: "/upload",         icon: Upload,            label: "Publicar Documento" },
  { href: "/correspondents", icon: User,              label: "Correspondentes" },
  { href: "/tags",           icon: Tag,               label: "Etiquetas" },
  { href: "/storage-paths",  icon: Folder,            label: "Caminhos" },
  { href: "/doc-types",      icon: FileText,          label: "Tipos de Documento" },
  { href: "/history",        icon: AlignLeft,         label: "Logs de Auditoria" },
  { href: "/settings",       icon: Settings,          label: "Configurações" },
  { href: "/groups",         icon: Users,             label: "Usuários & Grupos" },
  { href: "/customize",      icon: SlidersHorizontal, label: "Personalização" },
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
      <aside className="flex h-full w-64 flex-col bg-[#FF201A] shadow-xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
          <span className="text-white font-bold text-sm tracking-wide">Menu</span>
          <button
            onClick={onClose}
            data-testid="button-sidebar-close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 py-3 px-2 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}>
                <div
                  onClick={onClose}
                  data-testid={`nav-${href.replace("/", "")}`}
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 h-11 transition-all duration-150 ${
                    active ? "bg-white/20" : "hover:bg-white/15"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeBarMobile"
                      className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white"
                    />
                  )}
                  <Icon
                    size={19}
                    className={`flex-shrink-0 ${active ? "text-white" : "text-white/75 group-hover:text-white"}`}
                  />
                  <span className={`text-[13px] font-medium whitespace-nowrap ${active ? "text-white" : "text-white/75 group-hover:text-white"}`}>
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
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-screen flex-shrink-0 flex-col bg-[#FF201A] shadow-lg z-20 overflow-hidden"
    >
      <nav className="flex flex-1 flex-col items-center gap-0.5 pt-4 pb-4 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div
                data-testid={`nav-${href.replace("/", "")}`}
                title={collapsed ? label : undefined}
                className={`group relative flex cursor-pointer items-center gap-3 rounded-lg transition-all duration-150 ${
                  collapsed ? "w-10 h-10 justify-center" : "w-[200px] h-10 px-3"
                } ${active ? "bg-white/20" : "hover:bg-white/15"}`}
              >
                {active && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white"
                  />
                )}
                <Icon
                  size={19}
                  className={`flex-shrink-0 transition-colors ${
                    active ? "text-white" : "text-white/75 group-hover:text-white"
                  }`}
                />
                {showLabel && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    className={`text-[13px] font-medium whitespace-nowrap leading-tight ${
                      active ? "text-white" : "text-white/75 group-hover:text-white"
                    }`}
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
