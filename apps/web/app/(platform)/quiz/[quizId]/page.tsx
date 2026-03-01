import dynamic from "next/dynamic";

const QuizContainer = dynamic(
  () => import("@/components/quiz/QuizContainer").then((m) => m.QuizContainer),
  {
    loading: () => (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  }
);

interface QuizPageProps {
  params: { quizId: string };
  searchParams: { lesson?: string };
}

export default function QuizPage({ params, searchParams }: QuizPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <QuizContainer
        quizId={params.quizId}
        lessonUrl={searchParams.lesson}
      />
    </div>
  );
}
