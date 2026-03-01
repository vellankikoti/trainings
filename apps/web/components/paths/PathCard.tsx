import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const COLOR_MAP: Record<string, string> = {
  green: "bg-green-500/10 text-green-700 dark:text-green-400",
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  red: "bg-red-500/10 text-red-700 dark:text-red-400",
  orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  yellow: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

interface PathCardProps {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  color: string;
  moduleCount: number;
  lessonCount: number;
  estimatedHours: number;
}

export function PathCard({
  slug,
  title,
  description,
  difficulty,
  color,
  moduleCount,
  lessonCount,
  estimatedHours,
}: PathCardProps) {
  return (
    <Link href={`/paths/${slug}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{title}</h3>
            <Badge variant="outline" className={COLOR_MAP[color] || ""}>
              {difficulty}
            </Badge>
          </div>
          <p className="mt-3 flex-1 text-muted-foreground">{description}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center text-sm">
            <div>
              <div className="font-semibold">{moduleCount}</div>
              <div className="text-muted-foreground">Modules</div>
            </div>
            <div>
              <div className="font-semibold">{lessonCount}+</div>
              <div className="text-muted-foreground">Lessons</div>
            </div>
            <div>
              <div className="font-semibold">{estimatedHours}h</div>
              <div className="text-muted-foreground">Est. Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
