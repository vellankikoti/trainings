import { redirect } from "next/navigation";
import { requireAuth, AuthError } from "@/lib/auth";
import { InstituteRegistrationForm } from "./InstituteRegistrationForm";

export const metadata = {
  title: "Register Institute",
  description: "Register your training institute on the platform.",
};

export default async function RegisterInstitutePage() {
  let ctx;
  try {
    ctx = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) redirect("/sign-in");
    throw e;
  }

  // If user already has an institute, redirect
  if (ctx.instituteId) {
    redirect("/institute");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register Your Institute</h1>
        <p className="mt-2 text-muted-foreground">
          Set up your training institute to manage batches, trainers, and track learner progress.
        </p>
      </div>
      <InstituteRegistrationForm />
    </div>
  );
}
