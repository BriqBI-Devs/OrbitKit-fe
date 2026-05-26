"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import api from "@/lib/axios";
import { errorMessage } from "@/lib/format";
import type { Pack } from "@/lib/types";
import { PackForm } from "@/components/packs/pack-form";

export default function EditPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/packs/admin/${id}`);
        if (active) setPack(res.data?.data ?? res.data);
      } catch (err) {
        if (active) setError(errorMessage(err, "Failed to load pack"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
        {error ?? "Pack not found."}
      </div>
    );
  }

  return <PackForm pack={pack} />;
}
