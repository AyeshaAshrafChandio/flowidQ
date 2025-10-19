import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 group",
        className
      )}
    >
      <ShieldCheck className="h-7 w-7 text-primary transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-6" />
      <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
        FlowIDQ
      </span>
    </div>
  );
}
