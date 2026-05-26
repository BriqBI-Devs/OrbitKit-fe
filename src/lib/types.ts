/** Shared admin API entity types. */

export type ApiList<T> = { data: T[] };
export type ApiItem<T> = { data: T };

export type Category = {
  _id: string;
  name: string;
  slug?: string;
  kind: "pack" | "blog";
  description?: string;
  sortOrder?: number;
};

export type PackFeature = { label: string; sortOrder?: number };
export type PackFaq = { question: string; answer: string; sortOrder?: number };
export type PackFile = {
  tier: "diy" | "done_with_you" | "done_for_you";
  label: string;
  storagePath: string;
  sizeBytes?: number;
};

export type Pack = {
  _id?: string;
  slug: string;
  title: string;
  shortDescription?: string;
  longDescriptionHtml?: string;
  categoryId?: string | null;
  tags?: string[];
  status: "draft" | "published";
  featured?: boolean;
  sortOrder?: number;
  heroImageUrl?: string;
  galleryImageUrls?: string[];
  demoVideoUrl?: string;
  priceDiyUsd: number;
  priceDoneWithYouUsd?: number | null;
  priceDoneForYouUsd?: number | null;
  priceManagedMonthlyUsd?: number | null;
  m365Licenses?: string[];
  bookingUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  features?: PackFeature[];
  faqs?: PackFaq[];
  files?: PackFile[];
  createdAt?: string;
  updatedAt?: string;
};

export type BlogPost = {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml?: string;
  coverImageUrl?: string;
  contentImages?: string[];
  author?: { name?: string; email?: string };
  categoryId?: string | null;
  tags?: string[];
  status: "draft" | "scheduled" | "published";
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  views?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Order = {
  _id: string;
  customerEmail?: string;
  packSlugSnapshot?: string;
  tier?: string;
  amountUsdCents?: number;
  paymentProvider?: "paypal" | "razorpay";
  paymentId?: string;
  status?: "pending" | "paid" | "fulfilled" | "refunded" | "failed";
  downloadToken?: string;
  createdAt?: string;
};

export type Subscription = {
  _id: string;
  customerEmail?: string;
  packSlugSnapshot?: string;
  priceUsdCents?: number;
  paymentProvider?: string;
  status?: "pending" | "active" | "past_due" | "cancelled" | "expired";
  currentPeriodEnd?: string;
  createdAt?: string;
};

export type Lead = {
  _id: string;
  name?: string;
  email?: string;
  company?: string;
  companySize?: string;
  m365Plan?: string;
  packOfInterest?: string;
  budget?: string;
  timeline?: string;
  message?: string;
  status?: "new" | "contacted" | "qualified" | "converted" | "lost";
  notes?: string;
  source?: string;
  createdAt?: string;
};

export type Subscriber = {
  _id: string;
  email?: string;
  source?: string;
  confirmed?: boolean;
  createdAt?: string;
};

export type Onboarding = {
  _id: string;
  customerEmail?: string;
  customerName?: string;
  company?: string;
  m365Tenant?: string;
  adminContact?: string;
  preferredWindow?: string;
  customizations?: string;
  constraintsText?: string;
  status?: "received" | "in_progress" | "scheduled" | "delivered" | "cancelled";
  notes?: string;
  createdAt?: string;
};

export type AdminUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  profileImage?: string;
  createdAt?: string;
};

export type ActivityEntry = {
  _id: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  actorEmail?: string;
  createdAt?: string;
};

export type Setting = {
  _id?: string;
  key: string;
  value: string;
};
