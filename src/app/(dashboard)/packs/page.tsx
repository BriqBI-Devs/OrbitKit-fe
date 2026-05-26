"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDate, formatUsd } from "@/lib/format";
import type { Pack } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function PacksPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<
    | { type: "delete"; id: string; title?: string }
    | { type: "bulk-delete" }
    | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/packs/admin/all?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setPacks(Array.isArray(data) ? data : []);
      setSelected(new Set());
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load packs"));
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(packs.map((p) => p._id!)) : new Set());

  const togglePublish = async (pack: Pack) => {
    const next = pack.status === "published" ? "draft" : "published";
    try {
      await api.patch(`/packs/admin/${pack._id}/status`, { status: next });
      toast.success(next === "published" ? "Pack published" : "Pack unpublished");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update status"));
    }
  };

  const deletePack = async (id: string) => {
    try {
      await api.delete(`/packs/admin/${id}`);
      toast.success("Pack deleted");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete pack"));
    }
  };

  const bulkAction = async (action: "publish" | "unpublish" | "delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await api.post("/packs/admin/bulk", { ids, action });
      toast.success(`${ids.length} pack(s) ${action}ed`);
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Bulk action failed"));
    }
  };

  const columns: Column<Pack>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        cell: (p) => (
          <Link
            href={`/packs/${p._id}`}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {p.title || "Untitled"}
          </Link>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (p) => <StatusBadge status={p.status} />,
      },
      {
        key: "featured",
        header: "Featured",
        cell: (p) =>
          p.featured ? (
            <Star className="size-4 fill-amber-400 text-amber-400" />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: "priceDiy",
        header: "DIY",
        cell: (p) => formatUsd(p.priceDiyUsd),
      },
      {
        key: "priceDwy",
        header: "DWY",
        cell: (p) => formatUsd(p.priceDoneWithYouUsd),
      },
      {
        key: "priceDfy",
        header: "DFY",
        cell: (p) => formatUsd(p.priceDoneForYouUsd),
      },
      {
        key: "updatedAt",
        header: "Updated",
        cell: (p) => (
          <span className="text-muted-foreground">
            {formatDate(p.updatedAt ?? p.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        headClassName: "text-right",
        className: "text-right",
        cell: (p) => (
          <div
            className="flex justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              title={p.status === "published" ? "Unpublish" : "Publish"}
              onClick={() => togglePublish(p)}
            >
              {p.status === "published" ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Edit"
              onClick={() => router.push(`/packs/${p._id}`)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Delete"
              onClick={() =>
                setConfirm({ type: "delete", id: p._id!, title: p.title })
              }
            >
              <Trash2 className="text-destructive size-4" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Packs"
          description="Automation packs available in the catalog."
        />
        <Button asChild>
          <Link href="/packs/new">
            <Plus className="size-4" />
            New pack
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search packs…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {selected.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkAction("publish")}
            >
              <CheckCircle2 className="size-4" />
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkAction("unpublish")}
            >
              <EyeOff className="size-4" />
              Unpublish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm({ type: "bulk-delete" })}
            >
              <Trash2 className="text-destructive size-4" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelected(new Set())}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={packs}
        getRowId={(p) => p._id!}
        loading={loading}
        emptyMessage="No packs found."
        selectable
        selectedIds={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
      />

      <ConfirmDialog
        open={confirm?.type === "delete"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Delete pack?"
        description={
          confirm?.type === "delete"
            ? `"${confirm.title ?? "This pack"}" will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          confirm?.type === "delete" ? deletePack(confirm.id) : undefined
        }
      />
      <ConfirmDialog
        open={confirm?.type === "bulk-delete"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Delete ${selected.size} pack(s)?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => bulkAction("delete")}
      />
    </div>
  );
}
