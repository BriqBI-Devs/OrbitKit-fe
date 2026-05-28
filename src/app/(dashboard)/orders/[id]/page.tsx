"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDateTime, formatUsdCents } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2.5 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [resending, setResending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/orders/admin/${id}`);
      setOrder(res.data?.data ?? res.data);
    } catch (err) {
      setError(errorMessage(err, "Failed to load order"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refund = async () => {
    try {
      await api.post(`/orders/admin/${id}/refund`);
      toast.success("Order refunded");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Refund failed"));
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await api.post(`/orders/admin/${id}/resend-download`);
      toast.success("Download link resent");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to resend download"));
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
        {error ?? "Order not found."}
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
            onClick={() => router.push("/orders")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order detail</h1>
            <p className="text-muted-foreground font-mono text-xs">
              {order._id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resend} disabled={resending}>
            {resending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Resend download
          </Button>
          <Button
            variant="outline"
            onClick={() => setRefundOpen(true)}
            disabled={order.status === "refunded"}
          >
            <RotateCcw className="size-4" />
            Refund
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Status" value={<StatusBadge status={order.status} />} />
            <Row
              label="Amount"
              value={formatUsdCents(order.amountUsdCents)}
            />
            <Row
              label="Tier"
              value={
                order.tier ? (
                  <Badge variant="outline" className="capitalize">
                    {order.tier.replace(/_/g, " ")}
                  </Badge>
                ) : (
                  "—"
                )
              }
            />
            <Row label="Solution" value={order.packSlugSnapshot ?? "—"} />
            <Row label="Created" value={formatDateTime(order.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Customer" value={order.customerEmail ?? "—"} />
            <Row
              label="Provider"
              value={
                <span className="capitalize">
                  {order.paymentProvider ?? "—"}
                </span>
              }
            />
            <Row
              label="Payment ID"
              value={
                <span className="font-mono text-xs">
                  {order.paymentId ?? "—"}
                </span>
              }
            />
            <Row
              label="Download token"
              value={
                <span className="font-mono text-xs break-all">
                  {order.downloadToken ?? "—"}
                </span>
              }
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Refund this order?"
        description="This issues a refund through the payment provider and marks the order as refunded."
        confirmLabel="Refund"
        destructive
        onConfirm={refund}
      />
    </div>
  );
}
