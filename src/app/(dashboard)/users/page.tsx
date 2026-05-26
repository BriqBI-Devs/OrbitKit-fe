"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDate } from "@/lib/format";
import type { AdminUser } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role !== "all") params.set("role", role);
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/admin/users?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [q, role]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const columns: Column<AdminUser>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (u) => <span className="font-medium">{u.name ?? "—"}</span>,
      },
      {
        key: "email",
        header: "Email",
        cell: (u) => (
          <span className="text-muted-foreground">{u.email ?? "—"}</span>
        ),
      },
      {
        key: "role",
        header: "Role",
        cell: (u) =>
          u.role === "admin" ? (
            <Badge variant="info" className="capitalize">
              admin
            </Badge>
          ) : (
            <Badge variant="secondary" className="capitalize">
              {u.role ?? "user"}
            </Badge>
          ),
      },
      {
        key: "createdAt",
        header: "Joined",
        cell: (u) => (
          <span className="text-muted-foreground">
            {formatDate(u.createdAt)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Users"
        description="Registered accounts and their roles."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search users…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={users}
        getRowId={(u) => u._id}
        loading={loading}
        emptyMessage="No users found."
        onRowClick={(u) => router.push(`/users/${u._id}`)}
      />
    </div>
  );
}
