"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDateTime } from "@/lib/format";
import type { AdminUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2.5 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<AdminUser["role"]>("user");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      const data: AdminUser = res.data?.data ?? res.data;
      setUser(data);
      setRole(data.role ?? "user");
    } catch (err) {
      setError(errorMessage(err, "Failed to load user"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const saveRole = async (next: AdminUser["role"]) => {
    setRole(next);
    setSaving(true);
    try {
      await api.patch(`/admin/users/${id}/role`, { role: next });
      toast.success(`Role updated to ${next}`);
    } catch (err) {
      setRole(user?.role ?? "user");
      toast.error(errorMessage(err, "Failed to update role"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
        {error ?? "User not found."}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name ?? "User"}
          </h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row
              label="Current role"
              value={
                <Badge variant={user.role === "admin" ? "info" : "secondary"}>
                  {role}
                </Badge>
              }
            />
            <Row label="Joined" value={formatDateTime(user.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Role
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Label>Account role</Label>
            <Select
              value={role}
              onValueChange={(v) => saveRole(v as AdminUser["role"])}
            >
              <SelectTrigger className="w-full" disabled={saving}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Admins can access this dashboard. Changes apply immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
