import { SkipToContent } from "@/components/layout/SkipToContent";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipToContent />
      {children}
    </>
  );
}
