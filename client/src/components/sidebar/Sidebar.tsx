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
      <aside className="flex h-full w-80 flex-col bg-[#FF201A] shadow-xl">
        <div className="border-b border-white/20 px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">DocStation GED</p>
              <span className="mt-1 block text-lg font-bold text-white">Acesso rápido</span>
            </div>
            <button
              onClick={onClose}
              data-testid="button-sidebar-close"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="mt-3 text-sm text-white/80">
            Escolha a tarefa que você quer fazer agora.
          </p>
        </div>
        <div className="px-5 pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
          Navegação
        </div>
        <nav className="flex operator-scrollbar flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}>
                <div
                  onClick={onClose}
                  data-testid={`nav-${href.replace("/", "")}`}
                  className={`group relative flex cursor-pointer items-center gap-4 rounded-xl px-4 py-4 transition-all duration-150 ${
                    active ? "bg-white/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" : "hover:bg-white/15"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeBarMobile"
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-white"
                    />
                  )}
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/18" : "bg-white/10"}`}>
                    <Icon size={22} className={`${active ? "text-white" : "text-white/80 group-hover:text-white"}`} />
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-base font-semibold ${active ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                      {label}
                    </span>
                    <span className="block text-xs text-white/70">
                      {href === "/dashboard" ? "Ver visão geral" :
                        href === "/documents" ? "Abrir e localizar arquivos" :
                        href === "/upload" ? "Enviar novo documento" :
                        href === "/groups" ? "Liberar acesso ao app" :
                        "Abrir seção"}
                    </span>
                  </div>
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
      animate={{ width: collapsed ? 88 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="operator-scrollbar flex h-[calc(100vh-24px)] flex-shrink-0 flex-col overflow-hidden rounded-[18px] bg-[#FF201A] shadow-[0_20px_45px_rgba(28,31,46,0.18)]"
    >
      <div className={`border-b border-white/20 ${collapsed ? "px-3 py-5" : "px-5 py-6"}`}>
        {collapsed ? (
          <div className="h-12" />
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">DocStation GED</p>
            <h2 className="mt-2 text-xl font-bold text-white">Painel operacional</h2>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
          Menu principal
        </div>
      )}

      <nav className={`operator-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto ${collapsed ? "items-center px-2 py-4" : "px-3 py-4"}`}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div
                data-testid={`nav-${href.replace("/", "")}`}
                title={collapsed ? label : undefined}
                className={`group relative flex cursor-pointer items-center gap-3 rounded-xl transition-all duration-150 ${
                  collapsed ? "h-14 w-14 justify-center" : "min-h-[56px] w-full px-4"
                } ${active ? "bg-white/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" : "hover:bg-white/15"}`}
              >
                {active && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-white"
                  />
                )}
                <div className={`flex flex-shrink-0 items-center justify-center rounded-xl ${collapsed ? "h-10 w-10" : "h-11 w-11"} ${active ? "bg-white/18" : "bg-white/10"}`}>
                  <Icon size={20} className={`transition-colors ${active ? "text-white" : "text-white/80 group-hover:text-white"}`} />
                </div>
                {showLabel && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    className={`text-sm font-semibold whitespace-nowrap leading-tight ${active ? "text-white" : "text-white/90 group-hover:text-white"}`}
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
