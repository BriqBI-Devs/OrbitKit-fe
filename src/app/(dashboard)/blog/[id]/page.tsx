"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import api from "@/lib/axios";
import { errorMessage } from "@/lib/format";
import type { BlogPost } from "@/lib/types";
import { BlogForm } from "@/components/blog/blog-form";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/blogs/admin/${id}`);
        if (active) setPost(res.data?.data ?? res.data);
      } catch (err) {
        if (active) setError(errorMessage(err, "Failed to load post"));
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

  if (error || !post) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
        {error ?? "Post not found."}
      </div>
    );
  }

  return <BlogForm post={post} />;
}
