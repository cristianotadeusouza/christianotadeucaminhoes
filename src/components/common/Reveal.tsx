import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — revelação discreta ao entrar na viewport.
 *
 * O estado inicial é idêntico no servidor e no cliente (sem hidratação
 * divergente): a classe `reveal` deixa o bloco transparente e o atributo
 * `data-visible` é ligado pelo IntersectionObserver. Sem JS ou com
 * `prefers-reduced-motion`, o conteúdo permanece visível (ver styles.css).
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  direction = "up",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  /** Atraso em ms para escalonar itens de uma mesma grade. */
  delay?: number;
  /** Direção do movimento de entrada. Mantém a animação coerente sem repetir CSS. */
  direction?: "up" | "left" | "right" | "scale" | "clip";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-reveal-direction={direction}
      data-visible={visible ? "true" : "false"}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}
