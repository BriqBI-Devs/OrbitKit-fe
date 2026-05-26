"use client";

import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  /** Cell renderer. Receives the full row. */
  cell: (row: T) => React.ReactNode;
  className?: string;
  headClassName?: string;
};

/**
 * Generic styled data table with loading / empty states and an optional
 * leading selection column. Each list page declares its columns and rows.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyMessage = "No records found.",
  selectable = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  onRowClick?: (row: T) => void;
}) {
  const allSelected =
    selectable && rows.length > 0 && selectedIds?.size === rows.length;
  const someSelected =
    selectable && (selectedIds?.size ?? 0) > 0 && !allSelected;

  if (loading) {
    return (
      <div className="bg-card flex items-center justify-center gap-2 rounded-xl border py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border py-16 text-center text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="size-4 cursor-pointer rounded border-input accent-primary"
                  checked={!!allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !!someSelected;
                  }}
                  onChange={(e) => onToggleAll?.(e.target.checked)}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.key} className={col.headClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = getRowId(row);
            const selected = selectedIds?.has(id);
            return (
              <TableRow
                key={id}
                data-state={selected ? "selected" : undefined}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {selectable && (
                  <TableCell
                    className="w-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer rounded border-input accent-primary"
                      checked={!!selected}
                      onChange={() => onToggleRow?.(id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
