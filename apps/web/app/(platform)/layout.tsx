import { Header } from "@/components/layout/Header";
import { SidebarWrapper } from "@/components/layout/SidebarWrapper";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SkipToContent />
      {/* Sidebar — desktop only (hidden on mobile via CSS) */}
      <SidebarWrapper />
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <Header />
        <main id="main-content" className="flex-1" role="main">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
