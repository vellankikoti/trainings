import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModuleCardProps {
  pathSlug: string;
  moduleSlug: string;
  title: string;
  description: string;
  order: number;
  lessonsCount: number;
  estimatedHours: number;
  firstLessonSlug?: string;
}

export function ModuleCard({
  pathSlug,
  moduleSlug,
  title,
  description,
  order,
  lessonsCount,
  estimatedHours,
  firstLessonSlug,
}: ModuleCardProps) {
  const href = firstLessonSlug
    ? `/learn/${pathSlug}/${moduleSlug}/${firstLessonSlug}`
    : `/paths/${pathSlug}`;

  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {order}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
              <div className="mt-3 flex gap-3">
                <Badge variant="secondary">{lessonsCount} lessons</Badge>
                <Badge variant="outline">{estimatedHours}h</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
