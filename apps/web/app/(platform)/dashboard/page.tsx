import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Continue your DevOps journey.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Level", value: "1" },
          { label: "Total XP", value: "0" },
          { label: "Current Streak", value: "0 days" },
          { label: "Lessons Done", value: "0" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning */}
      <div>
        <h2 className="text-xl font-semibold">Continue Learning</h2>
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary">Foundations Path</Badge>
                <h3 className="mt-2 text-lg font-medium">
                  Linux Fundamentals
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start your journey with the Linux operating system
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">0% complete</div>
                <Progress value={0} className="mt-2 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
