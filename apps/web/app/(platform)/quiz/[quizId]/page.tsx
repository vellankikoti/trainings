import { QuizContainer } from "@/components/quiz/QuizContainer";

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
