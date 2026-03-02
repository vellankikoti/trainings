import { Header } from "@/components/layout/Header";
import { SkipToContent } from "@/components/layout/SkipToContent";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>
    </div>
  );
}
