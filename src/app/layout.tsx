import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "@/redux/provider";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OrbitKit Admin",
    template: "%s · OrbitKit Admin",
  },
  description: "Admin dashboard for OrbitKit automation solutions.",
  applicationName: "OrbitKit Admin",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "OrbitKit Admin",
    statusBarStyle: "default",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            {children}
            <Toaster position="top-right" richColors />
            <PwaRegister />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
