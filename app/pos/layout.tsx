import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { POSLayout } from "@/components/pos-layout";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Retail Management System",
  description: "Complete retail management solution",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <POSLayout>
          {children}
          <Toaster />
        </POSLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}
