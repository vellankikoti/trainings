import type { Metadata } from "next";
import { QuizContainer } from "@/components/quiz/QuizContainer";
import { getAssessment } from "@/lib/quiz";
import { notFound } from "next/navigation";

interface AssessmentPageProps {
  params: { moduleSlug: string };
  searchParams: { path?: string };
}

export async function generateMetadata({
  params,
  searchParams,
}: AssessmentPageProps): Promise<Metadata> {
  const pathSlug = searchParams.path || "foundations";
  const assessment = getAssessment(pathSlug, params.moduleSlug);

  return {
    title: assessment?.title ?? "Module Assessment",
    description: assessment?.description ?? "Complete this assessment to earn your certificate.",
  };
}

export default function AssessmentPage({
  params,
  searchParams,
}: AssessmentPageProps) {
  const pathSlug = searchParams.path || "foundations";
  const assessment = getAssessment(pathSlug, params.moduleSlug);

  if (!assessment) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-1 text-sm font-medium uppercase tracking-wider text-primary">
          Module Assessment
        </div>
        <h1 className="text-2xl font-bold">{assessment.title}</h1>
        {assessment.description && (
          <p className="mt-2 text-muted-foreground">{assessment.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{assessment.questions.length} questions</span>
          <span>Passing score: {assessment.passingScore}%</span>
          {assessment.timeLimit && (
            <span>Time limit: {Math.floor(assessment.timeLimit / 60)} minutes</span>
          )}
        </div>
      </div>
      <QuizContainer
        quizId={assessment.id}
        lessonUrl={`/paths/${pathSlug}`}
      />
    </div>
  );
}
