import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      data-testid="skeleton"
      className={cn("animate-pulse rounded-md bg-primary/10 cursor-progress", className)}
      {...props}
    />
  )
}

export { Skeleton }
