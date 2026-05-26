"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Known editable settings keys surfaced in the UI.
const KNOWN_KEYS: { key: string; label: string; description?: string }[] = [
  {
    key: "booking.default_url",
    label: "Default booking URL",
    description: "Used as the fallback call-booking link across the site.",
  },
  {
    key: "site.support_email",
    label: "Support email",
    description: "Public-facing support inbox.",
  },
  {
    key: "site.announcement",
    label: "Announcement banner",
    description: "Shown site-wide when set. Leave blank to hide.",
  },
];

/** Normalises the settings response into a key -> value map. */
function toMap(data: unknown): Record<string, string> {
  const map: Record<string, string> = {};
  if (Array.isArray(data)) {
    for (const s of data as { key?: string; value?: unknown }[]) {
      if (s?.key) map[s.key] = s.value == null ? "" : String(s.value);
    }
  } else if (data && typeof data === "object") {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      map[k] = v == null ? "" : String(v);
    }
  }
  return map;
}

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/admin/settings");
        const data = res.data?.data ?? res.data;
        if (active) setValues(toMap(data));
      } catch (err) {
        toast.error(errorMessage(err, "Failed to load settings"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = async (key: string) => {
    setSavingKey(key);
    try {
      await api.post("/admin/settings", { key, value: values[key] ?? "" });
      toast.success("Setting saved");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save setting"));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Global configuration for the OrbitKit site."
      />

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="grid max-w-2xl gap-4">
          {KNOWN_KEYS.map((setting) => (
            <Card key={setting.key}>
              <CardHeader>
                <CardTitle className="text-base">{setting.label}</CardTitle>
                {setting.description && (
                  <p className="text-muted-foreground text-sm">
                    {setting.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid gap-1.5">
                  <Label
                    htmlFor={setting.key}
                    className="text-muted-foreground font-mono text-xs"
                  >
                    {setting.key}
                  </Label>
                  <Input
                    id={setting.key}
                    value={values[setting.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [setting.key]: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  size="sm"
                  className="w-fit"
                  disabled={savingKey === setting.key}
                  onClick={() => save(setting.key)}
                >
                  {savingKey === setting.key ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
