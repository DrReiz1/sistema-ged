import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Home, User, Tag, Folder, FileText,
  Settings, SlidersHorizontal, Users, AlignLeft
} from "lucide-react";

const navItems = [
  { href: "/dashboard",     icon: LayoutDashboard,    label: "Início" },
  { href: "/documents",     icon: Home,               label: "Documentos" },
  { href: "/correspondents",icon: User,               label: "Correspondentes" },
  { href: "/tags",          icon: Tag,                label: "Etiquetas" },
  { href: "/storage-paths", icon: Folder,             label: "Caminhos de Armazenamento" },
  { href: "/doc-types",     icon: FileText,           label: "Tipos de Documento" },
  { href: "/settings",      icon: Settings,           label: "Configurações" },
  { href: "/customize",     icon: SlidersHorizontal,  label: "Personalização" },
  { href: "/groups",        icon: Users,              label: "Usuários & Grupos" },
  { href: "/history",       icon: AlignLeft,          label: "Logs" },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (href: string) =>
    location === href || (href !== "/dashboard" && location.startsWith(href));

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-screen flex-shrink-0 flex-col bg-[#FF201A] shadow-lg z-20 overflow-hidden"
    >
      {/* Navigation */}
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
                {/* Active indicator */}
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
                {!collapsed && (
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
