import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "@/redux/provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrbitKit Admin",
  description: "Admin dashboard for OrbitKit automation packs.",
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
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
