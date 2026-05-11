import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Bell, LogOut, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pageTitles: Record<string, string> = {
  "/dashboard": "Início",
  "/documents": "Documentos",
  "/upload": "Upload de Documento",
  "/history": "Histórico",
  "/groups": "Grupos e Usuários",
  "/settings": "Configurações",
  "/profile": "Perfil do Usuário",
};

export function Topbar() {
  const [location, navigate] = useLocation();
  const [searchValue, setSearchValue] = useState("");

  const pageTitle = Object.entries(pageTitles).find(([key]) =>
    location.startsWith(key)
  )?.[1] ?? "TSEA GED";

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) navigate("/documents?q=" + encodeURIComponent(searchValue));
  };

  return (
    <header className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
        <p className="text-xs text-gray-400">Sistema de Gerenciamento de Documentos Técnicos</p>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            data-testid="input-global-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Pesquisar documentos..."
            className="h-9 w-72 rounded-lg border-gray-200 bg-gray-50 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-[#FF201A]/30"
          />
        </form>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100" data-testid="button-notifications">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#FF201A]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF201A] text-sm font-bold text-white transition hover:bg-[#e01a14]"
              data-testid="button-user-menu"
            >
              AD
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 text-sm">
              <User size={14} /> Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="gap-2 text-sm text-red-600 focus:text-red-600"
              data-testid="button-logout"
            >
              <LogOut size={14} /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
