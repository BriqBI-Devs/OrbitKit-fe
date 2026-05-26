"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Download, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDateTime } from "@/lib/format";
import type { Subscriber } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/subscribers/admin/all?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load subscribers"));
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (id: string) => {
    try {
      await api.delete(`/subscribers/admin/${id}`);
      toast.success("Subscriber removed");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to remove subscriber"));
    }
  };

  const emails = useMemo(
    () => subscribers.map((s) => s.email).filter(Boolean).join(", "),
    [subscribers]
  );

  const copyEmails = async () => {
    if (!emails) return;
    try {
      await navigator.clipboard.writeText(emails);
      toast.success(`Copied ${subscribers.length} email(s)`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const exportCsv = () => {
    if (subscribers.length === 0) return;
    const header = "email,source,confirmed,createdAt";
    const rows = subscribers.map((s) =>
      [
        s.email ?? "",
        s.source ?? "",
        s.confirmed ? "yes" : "no",
        s.createdAt ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Subscriber>[] = useMemo(
    () => [
      {
        key: "email",
        header: "Email",
        cell: (s) => <span className="font-medium">{s.email ?? "—"}</span>,
      },
      {
        key: "source",
        header: "Source",
        cell: (s) => (
          <span className="text-muted-foreground">{s.source ?? "—"}</span>
        ),
      },
      {
        key: "confirmed",
        header: "Confirmed",
        cell: (s) =>
          s.confirmed ? (
            <Badge variant="success">Confirmed</Badge>
          ) : (
            <Badge variant="warning">Pending</Badge>
          ),
      },
      {
        key: "createdAt",
        header: "Subscribed",
        cell: (s) => (
          <span className="text-muted-foreground">
            {formatDateTime(s.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        headClassName: "text-right",
        className: "text-right",
        cell: (s) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Remove"
              onClick={() => setDeleteId(s._id)}
            >
              <Trash2 className="text-destructive size-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Subscribers"
          description="Newsletter mailing list."
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={copyEmails}
            disabled={subscribers.length === 0}
          >
            <Copy className="size-4" />
            Copy emails
          </Button>
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={subscribers.length === 0}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search subscribers…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={subscribers}
        getRowId={(s) => s._id}
        loading={loading}
        emptyMessage="No subscribers found."
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove subscriber?"
        description="They will no longer receive the newsletter."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (deleteId) remove(deleteId);
        }}
      />
    </div>
  );
}
