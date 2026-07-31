import { createFileRoute } from "@tanstack/react-router";

import { PainelApp } from "@/features/admin/PainelApp";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel comercial | Christiano Tadeu" },
      { name: "description", content: "Área privada de gestão comercial." },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: PainelPage,
});

function PainelPage() {
  return <PainelApp />;
}
