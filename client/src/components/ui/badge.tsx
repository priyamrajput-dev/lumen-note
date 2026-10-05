import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-base)] border bg-transparent px-2 py-0.5 text-[11px] font-mono whitespace-nowrap transition-colors select-none [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-border text-foreground",
        secondary: "border-border text-muted-foreground",
        outline: "border-border text-muted-foreground",
        ghost: "border-transparent text-muted-foreground",
        destructive: "border-destructive/50 text-destructive",
        link: "border-transparent text-foreground underline-offset-4 hover:underline",
        // Category colors — use token utilities so they flip light/dark
        sources: "border-category-sources/50 text-category-sources",
        chat: "border-category-chat/50 text-category-chat",
        artifacts: "border-category-artifacts/50 text-category-artifacts",
        memories: "border-category-memories/50 text-category-memories",
        workspaces: "border-category-workspaces/50 text-category-workspaces",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }