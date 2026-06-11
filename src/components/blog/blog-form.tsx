"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, slugify } from "@/lib/format";
import { useCategories } from "@/lib/use-categories";
import type { BlogPost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { SingleImageUploader } from "@/components/editor/image-uploader";
import { TagsInput } from "@/components/editor/tags-input";

const UPLOAD = "/blogs/admin/upload";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  bodyHtml: z.string().optional(),
  coverImageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "scheduled", "published"]),
  authorName: z.string().optional(),
  authorEmail: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  canonicalUrl: z.string().optional(),
  focusKeyword: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

function toFormValues(post?: BlogPost | null): BlogFormValues {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    bodyHtml: post?.bodyHtml ?? "",
    coverImageUrl: post?.coverImageUrl ?? "",
    categoryId: post?.categoryId ?? "",
    tags: post?.tags ?? [],
    status: post?.status ?? "draft",
    authorName: post?.author?.name ?? "",
    authorEmail: post?.author?.email ?? "",
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
    ogImageUrl: post?.ogImageUrl ?? "",
    canonicalUrl: post?.canonicalUrl ?? "",
    focusKeyword: post?.focusKeyword ?? "",
  };
}

export function BlogForm({ post }: { post?: BlogPost | null }) {
  const router = useRouter();
  const isEdit = !!post?._id;
  const { categories } = useCategories("blog");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: toFormValues(post),
  });

  const titleValue = watch("title");

  const onSubmit = async (values: BlogFormValues) => {
    setSubmitting(true);
    try {
      const { authorName, authorEmail, categoryId, ...rest } = values;
      const payload = {
        ...rest,
        categoryId: categoryId || null,
        author: { name: authorName, email: authorEmail },
      };
      if (isEdit) {
        await api.put(`/blogs/admin/${post!._id}`, payload);
        toast.success("Post updated");
      } else {
        await api.post("/blogs/admin", payload);
        toast.success("Post created");
      }
      router.push("/blog");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save post"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please fix the highlighted fields."))}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/blog")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit post" : "New post"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEdit ? post?.title : "Write a new blog post"}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isEdit ? "Save changes" : "Create post"}
        </Button>
      </div>

      <Tabs defaultValue="basics">
        <TabsList>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

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
                      setValue("slug", slugify(titleValue), {
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
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" rows={3} {...register("excerpt")} />
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
                          <SelectItem value="scheduled">Scheduled</SelectItem>
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
                  <Label htmlFor="authorName">Author name</Label>
                  <Input id="authorName" {...register("authorName")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="authorEmail">Author email</Label>
                  <Input id="authorEmail" {...register("authorEmail")} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Cover image</Label>
                <Controller
                  control={control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <SingleImageUploader
                      endpoint={UPLOAD}
                      fieldName="coverImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload cover image"
                      initialPreviewUrl={post?.coverImagePreviewUrl}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent>
              <Label className="mb-2">Body</Label>
              <Controller
                control={control}
                name="bodyHtml"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Write your post…"
                  />
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

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
                      fieldName="coverImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload OG image"
                      initialPreviewUrl={post?.ogImagePreviewUrl}
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
