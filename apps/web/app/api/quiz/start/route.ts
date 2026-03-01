import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getQuizById, getRandomQuestions } from "@/lib/quiz";
import { quizStartSchema, validateBody } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validated = validateBody(quizStartSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { quizId, questionCount } = validated.data;

  const quiz = getQuizById(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // Get randomized questions (strip correct answers for client)
  const questions = getRandomQuestions(quiz, questionCount);
  const clientQuestions = questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  }));

  return NextResponse.json({
    quizId: quiz.id,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    totalQuestions: clientQuestions.length,
    questions: clientQuestions,
  });
}
