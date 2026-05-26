"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { storageUrl } from "@/lib/storage";
import { errorMessage } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UploadedFile = { key: string; size: number };
type UploadResponse = { files?: Record<string, UploadedFile[]> };

async function uploadFiles(
  endpoint: string,
  fieldName: string,
  files: FileList | File[]
): Promise<UploadedFile[]> {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append(fieldName, file));
  const res = await api.post<UploadResponse>(endpoint, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.files?.[fieldName] ?? [];
}

function Thumb({
  src,
  onRemove,
}: {
  src: string;
  onRemove: () => void;
}) {
  const url = storageUrl(src);
  return (
    <div className="group bg-muted relative aspect-video overflow-hidden rounded-md border">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
          {src}
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="bg-destructive text-white absolute top-1 right-1 flex size-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Remove image"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/** Single hero/cover image uploader. Stores one key. */
export function SingleImageUploader({
  endpoint,
  fieldName,
  value,
  onChange,
  label = "Upload image",
}: {
  endpoint: string;
  fieldName: string;
  value?: string;
  onChange: (key: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(endpoint, fieldName, [files[0]]);
      if (uploaded[0]?.key) {
        onChange(uploaded[0].key);
        toast.success("Image uploaded");
      }
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {value ? (
        <div className="max-w-xs">
          <Thumb src={value} onRemove={() => onChange("")} />
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-fit"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {value ? "Replace image" : label}
      </Button>
    </div>
  );
}

/** Multi-image gallery uploader. Stores an array of keys. */
export function GalleryUploader({
  endpoint,
  fieldName,
  value,
  onChange,
}: {
  endpoint: string;
  fieldName: string;
  value: string[];
  onChange: (keys: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(endpoint, fieldName, files);
      const keys = uploaded.map((f) => f.key).filter(Boolean);
      if (keys.length) {
        onChange([...value, ...keys]);
        toast.success(`${keys.length} image(s) uploaded`);
      }
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((key, i) => (
            <Thumb
              key={`${key}-${i}`}
              src={key}
              onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn("w-fit")}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        Add images
      </Button>
    </div>
  );
}

export { uploadFiles };
