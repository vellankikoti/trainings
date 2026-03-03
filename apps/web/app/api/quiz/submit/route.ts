import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getQuizById, scoreQuiz } from "@/lib/quiz";
import { getProfileId } from "@/lib/progress";
import { awardXPWithLog } from "@/lib/xp-rewards";
import { updateStreak } from "@/lib/streaks";
import { recalculateSkillScores } from "@/lib/skills/score-calculator";
import { evaluateBadges } from "@/lib/badges";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { quizSubmitSchema, validateBody } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 requests/minute per user
  const rl = rateLimit(`quiz-submit:${clerkId}`, RATE_LIMITS.quizSubmit);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const body = await request.json();
  const validated = validateBody(quizSubmitSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { quizId, answers, timeSpentSeconds } = validated.data;

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

  // Award XP with logging and dedup
  let leveledUp = false;
  if (xpEarned > 0) {
    const source = scoring.score === 100 ? "quiz_perfect" : "quiz_pass";
    const attemptNum = (previousAttempts ?? 0) + 1;
    const result = await awardXPWithLog({
      userId: profileId,
      amount: xpEarned,
      source,
      sourceId: quizId,
      dedupKey: `${source}:${quizId}:attempt${attemptNum}`,
      metadata: { score: scoring.score, passed: scoring.passed },
    });
    leveledUp = result.leveledUp;
  }

  // Update streak and daily activity
  if (xpEarned > 0) {
    updateStreak(profileId, "quiz", xpEarned).catch((err) =>
      console.error("Streak update failed:", err),
    );
  }

  // Trigger skill score recalculation + badge evaluation
  let newBadges: Array<{ id: string; name: string; tier: string }> = [];
  try {
    await recalculateSkillScores(profileId);
    const badgeResult = await evaluateBadges(profileId);
    newBadges = badgeResult.newBadges.map((b) => ({
      id: b.id,
      name: b.name,
      tier: b.tier,
    }));
  } catch (err) {
    console.error("Post-quiz processing failed:", err);
  }

  return NextResponse.json({
    score: scoring.score,
    totalQuestions: scoring.totalQuestions,
    correctAnswers: scoring.correctAnswers,
    passed: scoring.passed,
    xpEarned,
    leveledUp,
    newBadges,
    results: scoring.results,
  });
}
