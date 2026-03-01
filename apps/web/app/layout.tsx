import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DEVOPS ENGINEERS — From Zero to Production-Ready",
    template: "%s | DEVOPS ENGINEERS",
  },
  description:
    "The open-source platform that transforms anyone into a production-ready DevOps engineer through story-driven learning, hands-on labs, and real-world projects.",
  keywords: [
    "devops",
    "kubernetes",
    "docker",
    "terraform",
    "aws",
    "linux",
    "sre",
    "learning platform",
  ],
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  // Clerk requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY at runtime.
  // When the key is not set (e.g. during CI builds) we skip the provider
  // so that `next build` can generate static pages without errors.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
