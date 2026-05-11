import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export const Desktop = (): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const loginMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/login", { username: email, password }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      navigate("/dashboard");
    },
    onError: async (err: any) => {
      const body = await err.response?.json?.().catch(() => null);
      setError(body?.message || "E-mail ou senha incorretos.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <main className="min-h-screen w-full overflow-x-auto bg-[#dbd8d3]">
      <header className="border-b border-black/10 bg-[#dcdcdc] shadow-[0px_4px_4px_#00000026]">
        <div className="flex min-h-[101px] items-center px-[28px] py-5">
          <img
            className="h-auto w-[235px] object-contain"
            alt="TSEA energia"
            src="/figmaAssets/download--1--1.png"
          />
        </div>
      </header>
      <section className="mx-auto flex min-h-[calc(100vh-101px)] w-full max-w-[1440px] items-start justify-center px-6 py-7 md:py-7">
        <Card className="mt-[1px] w-full max-w-[444px] rounded-[8px] border-0 bg-[#f3f3f3] shadow-none">
          <CardContent className="px-[22px] pb-10 pt-[44px]">
            <div className="flex flex-col items-center">
              <div className="flex items-end justify-center">
                <img
                  className="h-auto w-[182px] object-contain"
                  alt="TSEA GED"
                  src="/figmaAssets/download-2.png"
                />
                <img
                  className="-ml-1 mb-[3px] h-auto w-[74px] object-contain"
                  alt="GED"
                  src="/figmaAssets/chatgpt-image-1-de-mai--de-2026--12-21-43-1.png"
                />
              </div>
              <p className="mt-[1px] text-center [font-family:'Arial-BoldItalicMT',Helvetica] text-[11px] font-bold italic leading-none text-[#00000094]">
                Gerenciamento de documentos técnicos
              </p>
            </div>
            <form className="mt-[47px] space-y-[27px]" onSubmit={handleSubmit}>
              <div>
                <Label
                  htmlFor="email"
                  className="[font-family:'Arial-Bold',Helvetica] text-xl font-bold leading-none text-[#ff2c2ccc]"
                >
                  E-mail
                </Label>
                <div className="relative mt-[8px]">
                  <img
                    className="absolute left-[18px] top-1/2 h-auto w-[18px] -translate-y-1/2 object-contain"
                    alt="Ícone de e-mail"
                    src="/figmaAssets/icon.svg"
                  />
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-[38px] rounded-[10px] border-black/50 bg-[#f7f2f2] pl-14 pr-4 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="relative">
                <Label
                  htmlFor="password"
                  className="[font-family:'Arial-Bold',Helvetica] text-xl font-bold leading-none text-[#ff2c2ccc]"
                >
                  Senha
                </Label>
                <div className="relative mt-[8px]">
                  <img
                    className="absolute left-[18px] top-1/2 h-auto w-[19px] -translate-y-1/2 object-contain"
                    alt="Ícone de senha"
                    src="/figmaAssets/icon-2.svg"
                  />
                  <Input
                    id="password"
                    data-testid="input-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-[38px] rounded-[10px] border-black/50 bg-[#f7f2f2] pl-14 pr-14 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-[14px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center"
                  >
                    <img
                      className="h-auto w-[15px] object-contain"
                      alt="Mostrar senha"
                      src="/figmaAssets/icon-1.svg"
                    />
                  </button>
                </div>
              </div>

              {error && (
                <p data-testid="text-error" className="text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-center pt-[38px]">
                <Button
                  data-testid="button-login"
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="h-auto min-w-[121px] rounded-[4px] border border-[#bf0f0c] bg-[#ff201a] px-10 py-[9px] text-xl font-normal text-[#fde8e7] hover:bg-[#eb221e]"
                >
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};
