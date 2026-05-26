"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity as ActivityIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDateTime } from "@/lib/format";
import type { ActivityEntry } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ENTITY_TYPES = [
  "pack",
  "blog",
  "order",
  "subscription",
  "lead",
  "user",
  "category",
  "setting",
] as const;

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (entityType !== "all") params.set("entityType", entityType);
      const res = await api.get(`/admin/activity?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load activity"));
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Recent administrative actions across the system."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border">
        {loading ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div className="text-muted-foreground py-16 text-center text-sm">
            No activity recorded.
          </div>
        ) : (
          <ol className="divide-y">
            {entries.map((e) => (
              <li key={e._id} className="flex gap-3 px-4 py-3">
                <div className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                  <ActivityIcon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {e.actionType && (
                      <Badge variant="outline" className="capitalize">
                        {e.actionType.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {e.entityType && (
                      <span className="text-muted-foreground text-xs capitalize">
                        {e.entityType}
                      </span>
                    )}
                    <span className="text-muted-foreground ml-auto text-xs whitespace-nowrap">
                      {formatDateTime(e.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{e.summary ?? "—"}</p>
                  {e.actorEmail && (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      by {e.actorEmail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
