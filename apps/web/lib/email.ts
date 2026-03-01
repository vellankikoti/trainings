import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "DevOps Engineers <noreply@devopsengineer.com>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!resend) {
    console.log("[email] Resend not configured, skipping email:", { to, subject });
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email] Failed to send:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export function welcomeEmail(name: string) {
  const subject = "Welcome to DEVOPS ENGINEERS!";
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1e293b; font-size: 24px;">Welcome to DEVOPS ENGINEERS!</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        You've joined a community of engineers learning DevOps from zero to production-ready.
        Here's how to get started:
      </p>
      <ol style="color: #475569; font-size: 16px; line-height: 1.8;">
        <li>Complete your <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" style="color: #3b82f6;">onboarding profile</a></li>
        <li>Browse the <a href="${process.env.NEXT_PUBLIC_APP_URL}/paths" style="color: #3b82f6;">learning paths</a></li>
        <li>Start your first lesson and earn XP</li>
      </ol>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Go to Dashboard
        </a>
      </div>
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #94a3b8;">Unsubscribe</a>
      </p>
    </div>
  `;
  return { subject, html };
}

export function certificateEarnedEmail(name: string, certificateTitle: string, verificationCode: string) {
  const subject = `Congratulations! You earned: ${certificateTitle}`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1e293b; font-size: 24px;">Certificate Earned!</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Congratulations on earning your <strong>${certificateTitle}</strong> certificate!
        This is a real achievement — share it with your network.
      </p>
      <div style="margin: 24px 0; padding: 20px; background: #f0f9ff; border-radius: 8px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #475569;">Verification Code</p>
        <p style="margin: 8px 0; font-size: 24px; font-weight: bold; color: #1e293b; font-family: monospace;">
          ${verificationCode}
        </p>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/certificates/${verificationCode}"
           style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Certificate
        </a>
      </div>
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #94a3b8;">Unsubscribe</a>
      </p>
    </div>
  `;
  return { subject, html };
}

export function streakReminderEmail(name: string, currentStreak: number) {
  const subject = `Don't lose your ${currentStreak}-day streak!`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1e293b; font-size: 24px;">Keep Your Streak Alive!</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        You're on a <strong>${currentStreak}-day learning streak</strong>!
        Don't let it break — just one lesson keeps it going.
      </p>
      <div style="margin: 24px 0; padding: 20px; background: #fefce8; border-radius: 8px; text-align: center;">
        <p style="margin: 0; font-size: 48px;">🔥</p>
        <p style="margin: 8px 0 0; font-size: 20px; font-weight: bold; color: #1e293b;">
          ${currentStreak} Day Streak
        </p>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Continue Learning
        </a>
      </div>
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        DEVOPS ENGINEERS — From Zero to Production-Ready<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #94a3b8;">Unsubscribe</a>
      </p>
    </div>
  `;
  return { subject, html };
}
