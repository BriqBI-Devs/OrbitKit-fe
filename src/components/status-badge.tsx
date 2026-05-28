import { Badge } from "@/components/ui/badge";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info";

// Maps the various entity status strings to a badge variant.
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  // solutions / blog
  published: "success",
  draft: "secondary",
  scheduled: "info",
  // orders
  pending: "warning",
  paid: "info",
  fulfilled: "success",
  refunded: "secondary",
  failed: "destructive",
  // subscriptions
  active: "success",
  past_due: "warning",
  cancelled: "secondary",
  expired: "destructive",
  // leads
  new: "info",
  contacted: "warning",
  qualified: "info",
  converted: "success",
  lost: "destructive",
  // onboarding
  received: "info",
  in_progress: "warning",
  delivered: "success",
};

function humanize(status: string) {
  return status.replace(/_/g, " ");
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant="secondary">—</Badge>;
  const variant = STATUS_VARIANTS[status] ?? "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {humanize(status)}
    </Badge>
  );
}
