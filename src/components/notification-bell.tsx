"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  ShoppingCart,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import api from "@/lib/axios";

interface Notif {
  type: "lead" | "order" | "onboarding" | string;
  title: string;
  time: string;
  href: string;
}

const ICONS: Record<string, LucideIcon> = {
  lead: Sparkles,
  order: ShoppingCart,
  onboarding: UserCheck,
};

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await api.get("/admin/notifications");
        const d = res.data?.data ?? res.data;
        if (active) {
          setItems(Array.isArray(d?.items) ? d.items : []);
          setCount(d?.count ?? 0);
        }
      } catch {
        /* non-fatal */
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="hover:bg-accent relative flex size-9 items-center justify-center rounded-md transition-colors"
      >
        <Bell className="size-[18px]" />
        {count > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="bg-background absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <span className="text-sm font-semibold">Notifications</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-accent rounded p-1"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-muted-foreground px-4 py-8 text-center text-sm">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="max-h-96 overflow-y-auto">
                {items.map((n, i) => {
                  const Icon = ICONS[n.type] ?? Bell;
                  return (
                    <li key={`${n.href}-${i}`}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="hover:bg-accent flex items-start gap-3 px-4 py-3 transition-colors"
                      >
                        <span className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {n.title}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {timeAgo(n.time)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
