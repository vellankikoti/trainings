import { Header } from "@/components/layout/Header";
import { SkipToContent } from "@/components/layout/SkipToContent";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
