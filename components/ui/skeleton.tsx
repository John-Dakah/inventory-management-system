import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props} // ✅ Corrected spread syntax
    ></div> // ✅ Properly closed div
  );
}

export { Skeleton };
