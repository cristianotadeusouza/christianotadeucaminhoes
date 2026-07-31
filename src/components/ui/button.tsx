import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* --- Variantes de marca (ver docs/BRAND-IMPLEMENTATION.md) --- */
        /** CTA comercial principal — Vermelho Ação */
        action:
          "bg-action text-action-foreground shadow-sm hover:bg-action/90 active:bg-action/95 font-semibold",
        /** CTA institucional — Azul Engenharia */
        institutional:
          "bg-engineering text-engineering-foreground shadow-sm hover:bg-engineering/90 font-semibold",
        /** WhatsApp — Verde Resultado (uso restrito) */
        whatsapp: "bg-result text-result-foreground shadow-sm hover:bg-result/90 font-semibold",
        /** Contorno sobre fundos escuros institucionais */
        onDark:
          "border border-silver/40 bg-transparent text-road-foreground hover:bg-road-foreground/10 font-medium",
        /** Contorno neutro sobre fundo claro */
        quiet:
          "border border-border bg-background text-foreground hover:bg-surface font-medium shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6",
        xl: "h-12 rounded-md px-7 text-base",
        icon: "h-10 w-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
