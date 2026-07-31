import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { whatsappMessages } from "@/services/whatsapp";
import { navGroups, primaryNav } from "@/components/layout/navigation";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/utils";

/** Cabeçalho principal — mobile-first, com menu lateral no celular. */
export function Header() {
  const [open, setOpen] = useState(false);
  const { progress, scrolled } = useScrollProgress();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-300 supports-[backdrop-filter]:bg-background/88",
        scrolled ? "border-border/80 shadow-card" : "border-border",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-action/80 transition-transform duration-150 ease-linear"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div
        className={cn(
          "container-content grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 transition-[padding] duration-300",
          scrolled ? "py-2" : "py-3.5",
        )}
      >
        <BrandLogo size="lg" className="max-w-[15rem] sm:max-w-[18rem]" />

        <div className="flex items-center gap-2">
          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeProps={{ className: "text-engineering bg-surface" }}
                    className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface hover:text-engineering"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {navGroups.map((group) => (
                <li key={group.label} className="group relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface hover:text-engineering"
                    aria-haspopup="true"
                  >
                    {group.label}
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </button>
                  <div className="invisible absolute left-0 top-full w-64 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="rounded-lg border border-border bg-popover p-2 shadow-raised">
                      {group.items.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-surface hover:text-engineering"
                          >
                            <span className="font-medium">{item.label}</span>
                            {item.description && (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <Button asChild variant="action" size="default" className="hidden sm:inline-flex">
            <Link to="/diagnostico">Analisar operação</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="quiet" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <MobileMenu onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/** Menu de navegação para telas pequenas. */
export function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <BrandLogo size="sm" lockup="full" asLink={false} className="max-w-[11rem]" />
        <Button variant="ghost" size="icon" onClick={onNavigate} aria-label="Fechar menu">
          <X aria-hidden="true" />
        </Button>
      </div>

      <nav aria-label="Navegação" className="flex-1 px-5 py-5">
        <ul className="space-y-1">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                activeProps={{ className: "text-engineering" }}
                className="block rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-surface"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {navGroups.map((group) => (
          <div key={group.label} className="mt-6">
            <p className="eyebrow px-3 text-muted-foreground">{group.label}</p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className="block rounded-md px-3 py-3 text-base text-foreground hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-border px-5 py-5">
        <Button asChild variant="action" size="lg" className="w-full" onClick={onNavigate}>
          <Link to="/diagnostico">Analisar minha operação</Link>
        </Button>
        <WhatsAppButton
          message={whatsappMessages.general}
          context={{ placement: "mobile_menu" }}
          className="w-full"
        />
      </div>
    </div>
  );
}
