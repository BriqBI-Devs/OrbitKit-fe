"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getMyDetails } from "@/redux/thunks/auth.thunks";

/**
 * Client-side guard for the admin shell.
 * - Dispatches getMyDetails (GET /auth/me) on mount.
 * - Shows a centered spinner while the check is in flight.
 * - Redirects to /login when the session is missing or the role is not "admin".
 */
export function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(getMyDetails());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
