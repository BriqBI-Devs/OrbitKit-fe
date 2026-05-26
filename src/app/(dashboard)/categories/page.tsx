"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage } from "@/lib/format";
import type { Category } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Kind = "pack" | "blog";

type EditState = {
  _id?: string;
  name: string;
  description: string;
  sortOrder: number;
};

const emptyEdit: EditState = { name: "", description: "", sortOrder: 0 };

export default function CategoriesPage() {
  const [kind, setKind] = useState<Kind>("pack");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [edit, setEdit] = useState<EditState>(emptyEdit);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?kind=${kind}`);
      const data = res.data?.data ?? res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEdit(emptyEdit);
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEdit({
      _id: c._id,
      name: c.name,
      description: c.description ?? "",
      sortOrder: c.sortOrder ?? 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!edit.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: edit.name.trim(),
        description: edit.description.trim() || undefined,
        sortOrder: edit.sortOrder,
        kind,
      };
      if (edit._id) {
        await api.put(`/categories/admin/${edit._id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories/admin", payload);
        toast.success("Category created");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/categories/admin/${id}`);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete category"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Categories"
          description="Manage pack and blog categories."
        />
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)}>
        <TabsList>
          <TabsTrigger value="pack">Pack categories</TabsTrigger>
          <TabsTrigger value="blog">Blog categories</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card mt-4 overflow-hidden rounded-xl border">
        {loading ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="text-muted-foreground py-16 text-center text-sm">
            No categories yet.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.slug ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {c.description ?? "—"}
                  </TableCell>
                  <TableCell>{c.sortOrder ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(c._id)}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {edit._id ? "Edit category" : "New category"}
            </DialogTitle>
          </DialogHeader>
          <Card className="border-0 py-0 shadow-none">
            <CardContent className="grid gap-4 px-0">
              <div className="grid gap-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  value={edit.name}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  rows={2}
                  value={edit.description}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cat-order">Sort order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  value={edit.sortOrder}
                  onChange={(e) =>
                    setEdit((s) => ({
                      ...s,
                      sortOrder: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete category?"
        description="Packs or posts using it will be left without a category."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteId) remove(deleteId);
        }}
      />
    </div>
  );
}
