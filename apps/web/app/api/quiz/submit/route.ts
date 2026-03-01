import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getQuizById, scoreQuiz } from "@/lib/quiz";
import { getProfileId, awardXP } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { quizId, answers, timeSpentSeconds } = body;

  if (!quizId || !answers) {
    return NextResponse.json(
      { error: "Missing required fields: quizId, answers" },
      { status: 400 },
    );
  }

  const quiz = getQuizById(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Score the quiz
  const scoring = scoreQuiz(quiz, answers);

  // Check if this is a retry
  const supabase = createAdminClient();
  const { count: previousAttempts } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profileId)
    .eq("quiz_id", quizId);

  const isRetry = (previousAttempts ?? 0) > 0;

  // Determine XP reward
  let xpEarned = 0;
  if (scoring.passed) {
    if (scoring.score === 100) {
      xpEarned = isRetry ? quiz.xpRewards.retry : quiz.xpRewards.perfect;
    } else {
      xpEarned = isRetry ? quiz.xpRewards.retry : quiz.xpRewards.pass;
    }
  }

  // Save attempt
  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: profileId,
      quiz_id: quizId,
      lesson_slug: quiz.lessonSlug,
      module_slug: quiz.moduleSlug,
      score: scoring.score,
      total_questions: scoring.totalQuestions,
      correct_answers: scoring.correctAnswers,
      passed: scoring.passed,
      xp_earned: xpEarned,
      time_spent_seconds: timeSpentSeconds ?? null,
    })
    .select("id")
    .single();

  // Save individual responses
  if (attempt) {
    const responses = scoring.results.map((r) => ({
      attempt_id: attempt.id,
      question_id: r.questionId,
      selected_answer: String(r.selectedAnswer),
      correct: r.correct,
    }));

    await supabase.from("quiz_responses").insert(responses);
  }

  // Award XP
  let leveledUp = false;
  if (xpEarned > 0) {
    const result = await awardXP(profileId, xpEarned, "quiz_complete");
    leveledUp = result.leveledUp;
  }

  return NextResponse.json({
    score: scoring.score,
    totalQuestions: scoring.totalQuestions,
    correctAnswers: scoring.correctAnswers,
    passed: scoring.passed,
    xpEarned,
    leveledUp,
    results: scoring.results,
  });
}
