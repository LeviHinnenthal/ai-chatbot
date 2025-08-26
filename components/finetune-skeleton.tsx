import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function FinetuneSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border relative rounded-lg p-4 space-y-4 animate-pulse flex items-center justify-center",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin" />
        <p className="text-xs text-muted-foreground text-center">
          New finetune being created. This may take a few minutes...
        </p>
      </div>
    </div>
  );
}
