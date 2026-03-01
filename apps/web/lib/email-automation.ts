import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devopsengineer.com";

/**
 * Email automation sequences for user retention and engagement.
 *
 * Sequences:
 * - Welcome series: day 1, day 3, day 7
 * - Inactive user: 7 days, 14 days, 30 days
 * - Module completion celebration
 * - Streak milestones: 7, 30, 100 days
 * - Monthly progress summary
 */

export type EmailType =
  | "welcome_day1"
  | "welcome_day3"
  | "welcome_day7"
  | "inactive_7d"
  | "inactive_14d"
  | "inactive_30d"
  | "module_complete"
  | "streak_milestone"
  | "monthly_summary";

interface EmailPreferences {
  marketing: boolean;
  product_updates: boolean;
  streak_reminders: boolean;
  progress_reports: boolean;
}

const DEFAULT_PREFERENCES: EmailPreferences = {
  marketing: true,
  product_updates: true,
  streak_reminders: true,
  progress_reports: true,
};

// --- Email preference helpers ---

export async function getEmailPreferences(
  userId: string,
): Promise<EmailPreferences> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("email_preferences")
    .eq("id", userId)
    .single();

  return { ...DEFAULT_PREFERENCES, ...(data?.email_preferences ?? {}) };
}

export async function updateEmailPreferences(
  userId: string,
  preferences: Partial<EmailPreferences>,
): Promise<void> {
  const supabase = createAdminClient();
  const current = await getEmailPreferences(userId);
  await supabase
    .from("profiles")
    .update({ email_preferences: { ...current, ...preferences } })
    .eq("id", userId);
}

function canSendEmailType(
  type: EmailType,
  prefs: EmailPreferences,
): boolean {
  switch (type) {
    case "welcome_day1":
    case "welcome_day3":
    case "welcome_day7":
      return prefs.product_updates;
    case "inactive_7d":
    case "inactive_14d":
    case "inactive_30d":
      return prefs.marketing;
    case "streak_milestone":
      return prefs.streak_reminders;
    case "module_complete":
    case "monthly_summary":
      return prefs.progress_reports;
    default:
      return true;
  }
}

// --- Email template generators ---

function welcomeDay3Email(name: string) {
  return {
    subject: "Quick tip: How to learn DevOps effectively",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e293b; font-size: 24px;">Learning DevOps the Right Way</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Here are 3 tips from engineers who've completed our program:
        </p>
        <ol style="color: #475569; font-size: 16px; line-height: 1.8;">
          <li><strong>Start with Linux</strong> — it's the foundation everything else builds on</li>
          <li><strong>Do the labs</strong> — reading alone won't make you job-ready</li>
          <li><strong>Build a streak</strong> — even 15 minutes daily compounds fast</li>
        </ol>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${APP_URL}/paths/foundations"
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Start the Foundations Path
          </a>
        </div>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
          <a href="${APP_URL}/settings" style="color: #94a3b8;">Unsubscribe</a>
        </p>
      </div>`,
  };
}

function welcomeDay7Email(name: string) {
  return {
    subject: `${name}, have you started your first lesson?`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e293b; font-size: 24px;">Your DevOps Journey Awaits</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          It's been a week since you joined. The hardest part is starting — and the
          first lesson takes just 10 minutes.
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Our most popular first lesson is <strong>"What is Linux?"</strong> — a story about
          how a Finnish student changed the world.
        </p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${APP_URL}/learn/linux/what-is-linux"
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Read Your First Lesson (10 min)
          </a>
        </div>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
          <a href="${APP_URL}/settings" style="color: #94a3b8;">Unsubscribe</a>
        </p>
      </div>`,
  };
}

function inactiveUserEmail(name: string, daysInactive: 7 | 14 | 30) {
  const messages: Record<number, { subject: string; body: string }> = {
    7: {
      subject: `${name}, we miss you! Continue your DevOps journey`,
      body: "It's been a week since your last lesson. Pick up right where you left off — your progress is saved.",
    },
    14: {
      subject: "Your DevOps skills are waiting for you",
      body: "Two weeks have passed. The job market for DevOps engineers is growing fast — don't fall behind. Jump back in with a quick lesson.",
    },
    30: {
      subject: "Still interested in DevOps? We've added new content!",
      body: "It's been a month, and we've been busy adding new lessons and labs. Come see what's new and restart your learning journey.",
    },
  };

  const msg = messages[daysInactive];
  return {
    subject: msg.subject,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e293b; font-size: 24px;">Come Back and Learn!</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">${msg.body}</p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${APP_URL}/dashboard"
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Resume Learning
          </a>
        </div>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
          <a href="${APP_URL}/settings" style="color: #94a3b8;">Unsubscribe from these emails</a>
        </p>
      </div>`,
  };
}

function moduleCompleteEmail(
  name: string,
  moduleName: string,
  lessonsCompleted: number,
  nextModuleName?: string,
) {
  return {
    subject: `You completed ${moduleName}!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e293b; font-size: 24px;">Module Complete!</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          You just completed <strong>${moduleName}</strong> — that's ${lessonsCompleted} lessons done!
          This is a real milestone. You're building skills that companies are actively hiring for.
        </p>
        ${nextModuleName ? `
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Ready for the next challenge? <strong>${nextModuleName}</strong> is waiting for you.
        </p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${APP_URL}/paths"
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Start Next Module
          </a>
        </div>` : `
        <div style="margin-top: 24px; text-align: center;">
          <a href="${APP_URL}/paths"
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Explore More Modules
          </a>
        </div>`}
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
          <a href="${APP_URL}/settings" style="color: #94a3b8;">Unsubscribe</a>
        </p>
      </div>`,
  };
}

function streakMilestoneEmail(name: string, streakDays: number) {
  const milestoneMessages: Record<number, string> = {
    7: "One week of consistent learning! You're building a habit that will change your career.",
    30: "A full month of daily learning! You're in the top 5% of our community.",
    100: "100 days! You're a true DevOps champion. This kind of dedication is extraordinary.",
  };

  const message = milestoneMessages[streakDays] || `${streakDays} days of learning!`;

  return {
    subject: `${streakDays}-day streak! You're on fire!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 64px;">&#x1F525;</span>
          <h1 style="color: #1e293b; font-size: 24px; margin-top: 8px;">${streakDays}-Day Streak!</h1>
        </div>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">${message}</p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${APP_URL}/dashboard"
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Keep Going!
          </a>
        </div>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
          <a href="${APP_URL}/settings" style="color: #94a3b8;">Unsubscribe</a>
        </p>
      </div>`,
  };
}

function monthlySummaryEmail(
  name: string,
  stats: {
    lessonsCompleted: number;
    xpEarned: number;
    currentStreak: number;
    level: number;
  },
) {
  return {
    subject: "Your monthly DevOps learning summary",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e293b; font-size: 24px;">Your Monthly Summary</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Here's what you accomplished this month:
        </p>
        <div style="margin: 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #1e293b;">${stats.lessonsCompleted}</div>
            <div style="font-size: 13px; color: #64748b;">Lessons Completed</div>
          </div>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #1e293b;">${stats.xpEarned.toLocaleString()}</div>
            <div style="font-size: 13px; color: #64748b;">XP Earned</div>
          </div>
          <div style="background: #fefce8; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #1e293b;">${stats.currentStreak}</div>
            <div style="font-size: 13px; color: #64748b;">Day Streak</div>
          </div>
          <div style="background: #faf5ff; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #1e293b;">Lv.${stats.level}</div>
            <div style="font-size: 13px; color: #64748b;">Current Level</div>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="${APP_URL}/dashboard"
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Continue Learning
          </a>
        </div>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
          <a href="${APP_URL}/settings" style="color: #94a3b8;">Unsubscribe from progress reports</a>
        </p>
      </div>`,
  };
}

// --- Automation runner ---

/**
 * Send an automated email if the user hasn't unsubscribed from this type.
 * Returns true if sent, false if skipped.
 */
export async function sendAutomatedEmail(
  userId: string,
  email: string,
  type: EmailType,
  templateArgs: Record<string, unknown>,
): Promise<boolean> {
  const prefs = await getEmailPreferences(userId);
  if (!canSendEmailType(type, prefs)) {
    return false;
  }

  const name = (templateArgs.name as string) || "there";
  let emailContent: { subject: string; html: string };

  switch (type) {
    case "welcome_day3":
      emailContent = welcomeDay3Email(name);
      break;
    case "welcome_day7":
      emailContent = welcomeDay7Email(name);
      break;
    case "inactive_7d":
      emailContent = inactiveUserEmail(name, 7);
      break;
    case "inactive_14d":
      emailContent = inactiveUserEmail(name, 14);
      break;
    case "inactive_30d":
      emailContent = inactiveUserEmail(name, 30);
      break;
    case "module_complete":
      emailContent = moduleCompleteEmail(
        name,
        templateArgs.moduleName as string,
        templateArgs.lessonsCompleted as number,
        templateArgs.nextModuleName as string | undefined,
      );
      break;
    case "streak_milestone":
      emailContent = streakMilestoneEmail(
        name,
        templateArgs.streakDays as number,
      );
      break;
    case "monthly_summary":
      emailContent = monthlySummaryEmail(
        name,
        templateArgs.stats as {
          lessonsCompleted: number;
          xpEarned: number;
          currentStreak: number;
          level: number;
        },
      );
      break;
    default:
      return false;
  }

  await sendEmail({ to: email, ...emailContent });
  return true;
}

/**
 * Process welcome sequence for newly signed-up users.
 * Intended to be called by a cron job (e.g., daily at 9 AM UTC).
 */
export async function processWelcomeSequence(): Promise<{
  day3Sent: number;
  day7Sent: number;
}> {
  const supabase = createAdminClient();
  const now = new Date();

  // Day 3 welcome
  const day3Date = new Date(now);
  day3Date.setDate(day3Date.getDate() - 3);
  const day3Start = new Date(day3Date);
  day3Start.setHours(0, 0, 0, 0);
  const day3End = new Date(day3Date);
  day3End.setHours(23, 59, 59, 999);

  const { data: day3Users } = await supabase
    .from("profiles")
    .select("id, display_name, email, created_at")
    .gte("created_at", day3Start.toISOString())
    .lte("created_at", day3End.toISOString());

  let day3Sent = 0;
  for (const user of day3Users || []) {
    if (user.email) {
      const sent = await sendAutomatedEmail(user.id, user.email, "welcome_day3", {
        name: user.display_name || "there",
      });
      if (sent) day3Sent++;
    }
  }

  // Day 7 welcome
  const day7Date = new Date(now);
  day7Date.setDate(day7Date.getDate() - 7);
  const day7Start = new Date(day7Date);
  day7Start.setHours(0, 0, 0, 0);
  const day7End = new Date(day7Date);
  day7End.setHours(23, 59, 59, 999);

  const { data: day7Users } = await supabase
    .from("profiles")
    .select("id, display_name, email, created_at")
    .gte("created_at", day7Start.toISOString())
    .lte("created_at", day7End.toISOString());

  let day7Sent = 0;
  for (const user of day7Users || []) {
    if (user.email) {
      const sent = await sendAutomatedEmail(user.id, user.email, "welcome_day7", {
        name: user.display_name || "there",
      });
      if (sent) day7Sent++;
    }
  }

  return { day3Sent, day7Sent };
}

/**
 * Process inactive user re-engagement emails.
 * Intended to be called by a cron job (e.g., daily at 10 AM UTC).
 */
export async function processInactiveUserEmails(): Promise<{
  day7Sent: number;
  day14Sent: number;
  day30Sent: number;
}> {
  const supabase = createAdminClient();
  const now = new Date();
  const results = { day7Sent: 0, day14Sent: 0, day30Sent: 0 };

  const intervals: Array<{
    days: 7 | 14 | 30;
    type: EmailType;
    key: "day7Sent" | "day14Sent" | "day30Sent";
  }> = [
    { days: 7, type: "inactive_7d", key: "day7Sent" },
    { days: 14, type: "inactive_14d", key: "day14Sent" },
    { days: 30, type: "inactive_30d", key: "day30Sent" },
  ];

  for (const interval of intervals) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - interval.days);
    const targetStart = new Date(targetDate);
    targetStart.setHours(0, 0, 0, 0);
    const targetEnd = new Date(targetDate);
    targetEnd.setHours(23, 59, 59, 999);

    // Find users whose last activity was exactly N days ago
    const { data: inactiveUsers } = await supabase
      .from("daily_activity")
      .select("user_id, date")
      .gte("date", targetStart.toISOString())
      .lte("date", targetEnd.toISOString());

    if (!inactiveUsers) continue;

    const userIds = [...new Set(inactiveUsers.map((a) => a.user_id))];

    // Verify they haven't been active since
    for (const userId of userIds) {
      const { count } = await supabase
        .from("daily_activity")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gt("date", targetEnd.toISOString());

      if (count && count > 0) continue; // User has been active since — skip

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("id", userId)
        .single();

      if (profile?.email) {
        const sent = await sendAutomatedEmail(userId, profile.email, interval.type, {
          name: profile.display_name || "there",
        });
        if (sent) results[interval.key]++;
      }
    }
  }

  return results;
}

/**
 * Send streak milestone email if user just hit a milestone.
 */
export async function checkAndSendStreakMilestone(
  userId: string,
  email: string,
  name: string,
  currentStreak: number,
): Promise<boolean> {
  const milestones = [7, 30, 100];
  if (!milestones.includes(currentStreak)) return false;

  return sendAutomatedEmail(userId, email, "streak_milestone", {
    name,
    streakDays: currentStreak,
  });
}

/**
 * Send module completion celebration email.
 */
export async function sendModuleCompletionEmail(
  userId: string,
  email: string,
  name: string,
  moduleName: string,
  lessonsCompleted: number,
  nextModuleName?: string,
): Promise<boolean> {
  return sendAutomatedEmail(userId, email, "module_complete", {
    name,
    moduleName,
    lessonsCompleted,
    nextModuleName,
  });
}
