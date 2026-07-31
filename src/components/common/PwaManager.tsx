import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let pendingInstallPrompt: InstallPromptEvent | null = null;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function PwaManager() {
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // O site continua funcional mesmo quando o navegador bloqueia o service worker.
      });
    }

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      pendingInstallPrompt = event as InstallPromptEvent;
      window.dispatchEvent(new Event("ct-pwa-install-ready"));
    };
    const clearPrompt = () => {
      pendingInstallPrompt = null;
      window.dispatchEvent(new Event("ct-pwa-installed"));
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", clearPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", clearPrompt);
    };
  }, []);
  return null;
}

export function PwaInstallButton() {
  const [available, setAvailable] = useState(() => Boolean(pendingInstallPrompt));
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const ready = () => setAvailable(true);
    const done = () => {
      setAvailable(false);
      setInstalled(true);
    };
    window.addEventListener("ct-pwa-install-ready", ready);
    window.addEventListener("ct-pwa-installed", done);
    return () => {
      window.removeEventListener("ct-pwa-install-ready", ready);
      window.removeEventListener("ct-pwa-installed", done);
    };
  }, []);

  async function install() {
    if (!pendingInstallPrompt) {
      toast.info("No iPhone, use Compartilhar e depois Adicionar à Tela de Início.");
      return;
    }
    await pendingInstallPrompt.prompt();
    const choice = await pendingInstallPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      toast.success("Central adicionada ao aparelho.");
    }
    pendingInstallPrompt = null;
    setAvailable(false);
  }

  if (installed) {
    return (
      <Button type="button" variant="quiet" disabled>
        <Smartphone /> Instalado neste aparelho
      </Button>
    );
  }

  return (
    <Button type="button" variant="institutional" onClick={() => void install()}>
      <Download /> {available ? "Instalar central" : "Como instalar"}
    </Button>
  );
}
