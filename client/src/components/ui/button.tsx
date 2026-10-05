import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn-base group/button relative inline-flex shrink-0 items-center justify-center rounded-[100px] border font-semibold text-foreground whitespace-nowrap outline-none select-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-busy:cursor-wait [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "btn-variant-default text-foreground",
        primary:
          "btn-variant-primary text-foreground",
        outline:
          "btn-variant-outline text-foreground",
        secondary:
          "btn-variant-secondary text-foreground",
        ghost:
          "btn-variant-ghost text-muted-foreground hover:text-foreground",
        destructive:
          "btn-variant-destructive text-destructive",
        link:
          "btn-variant-link text-foreground p-0 h-auto",
        gradient:
          "btn-variant-primary text-foreground",
      },
      size: {
        default: "btn-size-default min-h-[44px] px-6 py-[12px] text-sm gap-2",
        xs: "btn-size-xs h-6 px-2.5 text-[11px] gap-1 [&_svg:not([class*='size-'])]:size-3",
        sm: "btn-size-sm h-8 px-4 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "btn-size-lg min-h-[50px] px-8 py-[14px] text-base gap-2.5",
        icon: "btn-size-icon size-9 rounded-full p-0 border-transparent text-muted-foreground hover:text-foreground bg-transparent",
        "icon-xs": "btn-size-icon-xs size-6 rounded-full p-0 border-transparent text-muted-foreground hover:text-foreground bg-transparent [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "btn-size-icon-sm size-7 rounded-full p-0 border-transparent text-muted-foreground hover:text-foreground bg-transparent [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "btn-size-icon-lg size-10 rounded-full p-0 border-transparent text-muted-foreground hover:text-foreground bg-transparent [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span className="btn-content relative z-10 inline-flex items-center justify-center gap-[inherit] w-full h-full pointer-events-none">
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin text-current shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v3.5a4.5 4.5 0 00-4.5 4.5H4z"
              />
            </svg>
            <span>{loadingText || children}</span>
          </>
        ) : (
          children
        )}
      </span>
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }