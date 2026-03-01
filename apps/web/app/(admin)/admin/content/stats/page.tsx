import { getFullContentStats } from "@/lib/content-stats";

export default function ContentStatsPage() {
  const stats = getFullContentStats();

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Content Statistics</h1>
      <p className="mt-2 text-muted-foreground">
        Detailed breakdown of platform content.
      </p>

      {/* Overview stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Learning Paths</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalPaths}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Modules</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalModules}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Lessons</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalLessons}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Total Words</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalWords.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Estimated Hours</p>
          <p className="mt-1 text-3xl font-bold">
            {Math.round(stats.totalEstimatedMinutes / 60)}
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Quizzes</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalQuizzes}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.totalQuizQuestions} questions
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Exercises</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalExercises}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Content Gaps</p>
          <p className="mt-1 text-3xl font-bold">{stats.contentGaps.length}</p>
        </div>
      </div>

      {/* Per-path breakdown */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Per-Path Breakdown</h2>
        <div className="mt-4 space-y-4">
          {stats.paths.map((pathStat) => (
            <div key={pathStat.slug} className="rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{pathStat.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {pathStat.totalWords.toLocaleString()} words
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span>{pathStat.moduleCount} modules</span>
                <span>{pathStat.lessonCount} lessons</span>
                <span>{Math.round(pathStat.totalEstimatedMinutes / 60)}h estimated</span>
              </div>

              {pathStat.modules.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-medium">Module</th>
                        <th className="pb-2 text-right font-medium">Lessons</th>
                        <th className="pb-2 text-right font-medium">Words</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pathStat.modules.map((moduleStat) => (
                        <tr key={moduleStat.slug} className="border-b last:border-0">
                          <td className="py-2">{moduleStat.title}</td>
                          <td className="py-2 text-right">{moduleStat.lessonCount}</td>
                          <td className="py-2 text-right">{moduleStat.totalWords.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content gaps */}
      {stats.contentGaps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Content Gaps</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Modules or paths that need content.
          </p>
          <ul className="mt-4 space-y-2">
            {stats.contentGaps.map((gap, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm"
              >
                <span className="text-destructive">&#9888;</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
