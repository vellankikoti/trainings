import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
