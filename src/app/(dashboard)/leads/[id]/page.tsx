"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDateTime } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";

const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2.5 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Lead["status"]>("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/leads/admin/${id}`);
      const data: Lead = res.data?.data ?? res.data;
      setLead(data);
      setStatus(data.status ?? "new");
      setNotes(data.notes ?? "");
    } catch (err) {
      setError(errorMessage(err, "Failed to load lead"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/leads/admin/${id}`, { status, notes });
      toast.success("Lead updated");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update lead"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/leads/admin/${id}`);
      toast.success("Lead deleted");
      router.push("/leads");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete lead"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
        {error ?? "Lead not found."}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/leads")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {lead.name ?? "Lead"}
            </h1>
            <p className="text-muted-foreground text-sm">{lead.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="text-destructive size-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enquiry</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Company" value={lead.company} />
            <Row label="Company size" value={lead.companySize} />
            <Row label="M365 plan" value={lead.m365Plan} />
            <Row label="Solution of interest" value={lead.packOfInterest} />
            <Row label="Budget" value={lead.budget} />
            <Row label="Timeline" value={lead.timeline} />
            <Row label="Source" value={lead.source} />
            <Row label="Received" value={formatDateTime(lead.createdAt)} />
            <div className="pt-3">
              <p className="text-muted-foreground mb-1 text-sm">Message</p>
              <p className="text-sm whitespace-pre-wrap">
                {lead.message || "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as Lead["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea
                id="notes"
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this lead…"
              />
            </div>
            <Button onClick={save} disabled={saving} className="w-fit">
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete lead?"
        description="This permanently removes the lead and its notes."
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </div>
  );
}
