import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MiniProjectProps {
  title: string;
  children: React.ReactNode;
}

export function MiniProject({ title, children }: MiniProjectProps) {
  return (
    <Card className="my-6 border-primary/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary">Mini Project</Badge>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="mt-3">{children}</div>
      </CardContent>
    </Card>
  );
}
