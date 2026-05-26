import { Construction } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20">
        <Construction className="size-8" />
        <p className="text-sm">This section is coming soon.</p>
      </div>
    </div>
  );
}
