import { AuthLoader } from "@/components/auth-loader";
import { DashboardShell } from "@/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLoader>
      <DashboardShell>{children}</DashboardShell>
    </AuthLoader>
  );
}
