"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatBytes, slugify } from "@/lib/format";
import { useCategories } from "@/lib/use-categories";
import type { Pack } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  GalleryUploader,
  SingleImageUploader,
  uploadFiles,
} from "@/components/editor/image-uploader";
import { TagsInput } from "@/components/editor/tags-input";

const UPLOAD = "/packs/admin/upload";

const fileSchema = z.object({
  tier: z.enum(["diy", "done_with_you", "done_for_you"]),
  label: z.string(),
  storagePath: z.string(),
  sizeBytes: z.number().optional(),
});

const packSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().optional(),
  longDescriptionHtml: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  sortOrder: z.number(),
  heroImageUrl: z.string().optional(),
  galleryImageUrls: z.array(z.string()),
  demoVideoUrl: z.string().optional(),
  priceDiyUsd: z.number({ message: "DIY price is required" }).min(0),
  priceDoneWithYouUsd: z.number().nullable(),
  priceDoneForYouUsd: z.number().nullable(),
  priceManagedMonthlyUsd: z.number().nullable(),
  m365Licenses: z.array(z.string()),
  bookingUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  canonicalUrl: z.string().optional(),
  focusKeyword: z.string().optional(),
  features: z.array(
    z.object({ label: z.string(), sortOrder: z.number().optional() })
  ),
  faqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      sortOrder: z.number().optional(),
    })
  ),
  files: z.array(fileSchema),
});

type PackFormValues = z.infer<typeof packSchema>;

const TIERS = [
  { value: "diy", label: "DIY" },
  { value: "done_with_you", label: "Done with you" },
  { value: "done_for_you", label: "Done for you" },
] as const;

function toFormValues(pack?: Pack | null): PackFormValues {
  return {
    title: pack?.title ?? "",
    slug: pack?.slug ?? "",
    shortDescription: pack?.shortDescription ?? "",
    longDescriptionHtml: pack?.longDescriptionHtml ?? "",
    categoryId: pack?.categoryId ?? "",
    tags: pack?.tags ?? [],
    status: pack?.status ?? "draft",
    featured: pack?.featured ?? false,
    sortOrder: pack?.sortOrder ?? 0,
    heroImageUrl: pack?.heroImageUrl ?? "",
    galleryImageUrls: pack?.galleryImageUrls ?? [],
    demoVideoUrl: pack?.demoVideoUrl ?? "",
    priceDiyUsd: pack?.priceDiyUsd ?? 0,
    priceDoneWithYouUsd: pack?.priceDoneWithYouUsd ?? null,
    priceDoneForYouUsd: pack?.priceDoneForYouUsd ?? null,
    priceManagedMonthlyUsd: pack?.priceManagedMonthlyUsd ?? null,
    m365Licenses: pack?.m365Licenses ?? [],
    bookingUrl: pack?.bookingUrl ?? "",
    metaTitle: pack?.metaTitle ?? "",
    metaDescription: pack?.metaDescription ?? "",
    ogImageUrl: pack?.ogImageUrl ?? "",
    canonicalUrl: pack?.canonicalUrl ?? "",
    focusKeyword: pack?.focusKeyword ?? "",
    features: pack?.features ?? [],
    faqs: pack?.faqs ?? [],
    files: pack?.files ?? [],
  };
}

/** Optional-number input that maps "" -> null. */
function PriceField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
          $
        </span>
        <Input
          type="number"
          min={0}
          className="pl-7"
          value={value === null ? "" : value}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          placeholder={required ? "0" : "—"}
        />
      </div>
    </div>
  );
}

export function PackForm({ pack }: { pack?: Pack | null }) {
  const router = useRouter();
  const isEdit = !!pack?._id;
  const { categories } = useCategories("pack");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PackFormValues>({
    resolver: zodResolver(packSchema),
    defaultValues: toFormValues(pack),
  });

  const features = useFieldArray({ control, name: "features" });
  const faqs = useFieldArray({ control, name: "faqs" });
  const files = useFieldArray({ control, name: "files" });

  const titleValue = watch("title");
  const slugValue = watch("slug");

  const onSubmit = async (values: PackFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        categoryId: values.categoryId || null,
      };
      if (isEdit) {
        await api.put(`/packs/admin/${pack!._id}`, payload);
        toast.success("Pack updated");
      } else {
        await api.post("/packs/admin", payload);
        toast.success("Pack created");
      }
      router.push("/packs");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save pack"));
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = () => {
    toast.error("Please fix the highlighted fields.");
  };

  const handleFileUpload = async (
    fieldName: "packZip" | "packGuidePdf",
    list: FileList | null
  ) => {
    if (!list || list.length === 0) return;
    setUploadingFiles(true);
    try {
      const uploaded = await uploadFiles(UPLOAD, fieldName, list);
      const fileArr = Array.from(list);
      uploaded.forEach((u, i) => {
        files.append({
          tier: "diy",
          label: fileArr[i]?.name ?? "Download",
          storagePath: u.key,
          sizeBytes: u.size,
        });
      });
      if (uploaded.length) toast.success(`${uploaded.length} file(s) uploaded`);
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed"));
    } finally {
      setUploadingFiles(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/packs")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit pack" : "New pack"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEdit ? pack?.title : "Create a new automation pack"}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isEdit ? "Save changes" : "Create pack"}
        </Button>
      </div>

      <Tabs defaultValue="basics">
        <TabsList>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* BASICS */}
        <TabsContent value="basics">
          <Card>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  aria-invalid={!!errors.title}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-destructive text-xs">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    aria-invalid={!!errors.slug}
                    {...register("slug")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setValue("slug", slugify(titleValue || slugValue), {
                        shouldValidate: true,
                      })
                    }
                  >
                    Generate
                  </Button>
                </div>
                {errors.slug && (
                  <p className="text-destructive text-xs">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shortDescription">Short description</Label>
                <Textarea
                  id="shortDescription"
                  rows={3}
                  {...register("shortDescription")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select
                        value={field.value || "none"}
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? "" : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <Controller
                  control={control}
                  name="tags"
                  render={({ field }) => (
                    <TagsInput value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">Sort order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    {...register("sortOrder", { valueAsNumber: true })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Controller
                    control={control}
                    name="featured"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="featured"
                      />
                    )}
                  />
                  <Label htmlFor="featured">Featured pack</Label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="demoVideoUrl">Demo video URL</Label>
                  <Input id="demoVideoUrl" {...register("demoVideoUrl")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bookingUrl">Booking URL</Label>
                  <Input id="bookingUrl" {...register("bookingUrl")} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>M365 licenses</Label>
                <Controller
                  control={control}
                  name="m365Licenses"
                  render={({ field }) => (
                    <TagsInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. Business Premium, E3 — Enter to add"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRICING */}
        <TabsContent value="pricing">
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="priceDiyUsd"
                render={({ field }) => (
                  <PriceField
                    label="DIY price (USD)"
                    required
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? 0)}
                  />
                )}
              />
              <Controller
                control={control}
                name="priceDoneWithYouUsd"
                render={({ field }) => (
                  <PriceField
                    label="Done with you (USD)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="priceDoneForYouUsd"
                render={({ field }) => (
                  <PriceField
                    label="Done for you (USD)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="priceManagedMonthlyUsd"
                render={({ field }) => (
                  <PriceField
                    label="Managed monthly (USD)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.priceDiyUsd && (
                <p className="text-destructive text-xs sm:col-span-2">
                  {errors.priceDiyUsd.message}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTENT */}
        <TabsContent value="content">
          <Card>
            <CardContent>
              <Label className="mb-2">Long description</Label>
              <Controller
                control={control}
                name="longDescriptionHtml"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Describe the pack, what's included, outcomes…"
                  />
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEDIA */}
        <TabsContent value="media">
          <Card>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label>Hero image</Label>
                <Controller
                  control={control}
                  name="heroImageUrl"
                  render={({ field }) => (
                    <SingleImageUploader
                      endpoint={UPLOAD}
                      fieldName="packHeroImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload hero image"
                    />
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label>Gallery</Label>
                <Controller
                  control={control}
                  name="galleryImageUrls"
                  render={({ field }) => (
                    <GalleryUploader
                      endpoint={UPLOAD}
                      fieldName="packGalleryImage"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FILES */}
        <TabsContent value="files">
          <Card>
            <CardContent className="grid gap-5">
              <div className="flex flex-wrap gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".zip"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload("packZip", e.target.files)
                    }
                  />
                  <span className="border-input bg-background hover:bg-accent inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium">
                    {uploadingFiles ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Upload ZIP
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload("packGuidePdf", e.target.files)
                    }
                  />
                  <span className="border-input bg-background hover:bg-accent inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium">
                    {uploadingFiles ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Upload PDF guide
                  </span>
                </label>
              </div>

              {files.fields.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No files uploaded yet.
                </p>
              ) : (
                <div className="grid gap-3">
                  {files.fields.map((f, i) => (
                    <div
                      key={f.id}
                      className="grid items-end gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Label</Label>
                        <Input {...register(`files.${i}.label` as const)} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Tier</Label>
                        <Controller
                          control={control}
                          name={`files.${i}.tier` as const}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIERS.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {formatBytes(getValues(`files.${i}.sizeBytes`))}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => files.remove(i)}
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEATURES */}
        <TabsContent value="features">
          <Card>
            <CardContent className="grid gap-3">
              {features.fields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <GripVertical className="text-muted-foreground size-4 shrink-0" />
                  <Input
                    placeholder="Feature label"
                    {...register(`features.${i}.label` as const)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => features.remove(i)}
                  >
                    <Trash2 className="text-destructive size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() =>
                  features.append({ label: "", sortOrder: features.fields.length })
                }
              >
                <Plus className="size-4" />
                Add feature
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQS */}
        <TabsContent value="faqs">
          <Card>
            <CardContent className="grid gap-4">
              {faqs.fields.map((f, i) => (
                <div key={f.id} className="grid gap-2 rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Question"
                      {...register(`faqs.${i}.question` as const)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => faqs.remove(i)}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Answer"
                    rows={2}
                    {...register(`faqs.${i}.answer` as const)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() =>
                  faqs.append({
                    question: "",
                    answer: "",
                    sortOrder: faqs.fields.length,
                  })
                }
              >
                <Plus className="size-4" />
                Add FAQ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Input id="metaTitle" {...register("metaTitle")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta description</Label>
                <Textarea
                  id="metaDescription"
                  rows={3}
                  {...register("metaDescription")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="focusKeyword">Focus keyword</Label>
                  <Input id="focusKeyword" {...register("focusKeyword")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input id="canonicalUrl" {...register("canonicalUrl")} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>OG image</Label>
                <Controller
                  control={control}
                  name="ogImageUrl"
                  render={({ field }) => (
                    <SingleImageUploader
                      endpoint={UPLOAD}
                      fieldName="packHeroImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload OG image"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
