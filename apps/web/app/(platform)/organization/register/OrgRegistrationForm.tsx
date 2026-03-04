"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  slug: string;
  description: string;
  website: string;
  company_size: string;
  location_city: string;
  location_country: string;
  billing_email: string;
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"];

export function OrgRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    website: "",
    company_size: "",
    location_city: "",
    location_country: "",
    billing_email: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
  };

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    try {
      const res = await fetch(`/api/slugs/check?slug=${encodeURIComponent(slug)}&type=organization`);
      const json = await res.json();
      setSlugStatus(json.data?.available ? "available" : "taken");
    } catch {
      setSlugStatus("idle");
    }
  }, []);

  const handleNameChange = (name: string) => {
    updateField("name", name);
    const slug = generateSlug(name);
    updateField("slug", slug);
    checkSlug(slug);
  };

  const handleSlugChange = (slug: string) => {
    const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    updateField("slug", cleaned);
    checkSlug(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/organizations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Registration failed");
      }

      const status = json.data?.status;
      if (status === "pending_approval") {
        setMessage({
          type: "success",
          text: "Your organization has been registered and is pending admin approval. You'll be notified once approved.",
        });
      } else {
        setMessage({ type: "success", text: "Organization registered successfully!" });
        setTimeout(() => router.push("/organization"), 1500);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Registration failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = formData.name.length >= 2 && formData.slug.length >= 2 && slugStatus !== "taken";
  const canProceedStep2 = formData.billing_email.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                s <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`h-0.5 w-8 ${s < step ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {step === 1 ? "Basic Info" : step === 2 ? "Details" : "Review"}
        </span>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Organization Info</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Organization Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Corp"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">URL Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/org/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="acme-corp"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            {slugStatus === "checking" && (
              <p className="mt-1 text-xs text-muted-foreground">Checking availability...</p>
            )}
            {slugStatus === "available" && (
              <p className="mt-1 text-xs text-green-600">This slug is available</p>
            )}
            {slugStatus === "taken" && (
              <p className="mt-1 text-xs text-red-600">This slug is already taken</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of your organization..."
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Organization Details</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Billing Email *</label>
            <input
              type="email"
              value={formData.billing_email}
              onChange={(e) => updateField("billing_email", e.target.value)}
              placeholder="billing@acme.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://acme.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <input
                type="text"
                value={formData.location_city}
                onChange={(e) => updateField("location_city", e.target.value)}
                placeholder="San Francisco"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <input
                type="text"
                value={formData.location_country}
                onChange={(e) => updateField("location_country", e.target.value)}
                placeholder="United States"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company Size</label>
            <select
              value={formData.company_size}
              onChange={(e) => updateField("company_size", e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select size...</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} employees
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border px-6 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Review & Submit</h2>
          <div className="space-y-3 rounded-lg bg-muted/30 p-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Slug</span>
              <span className="font-medium">/org/{formData.slug}</span>
            </div>
            {formData.description && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Description</span>
                <span className="max-w-xs text-right font-medium">{formData.description}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Billing Email</span>
              <span className="font-medium">{formData.billing_email}</span>
            </div>
            {formData.website && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Website</span>
                <span className="font-medium">{formData.website}</span>
              </div>
            )}
            {formData.company_size && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{formData.company_size} employees</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Your organization may require admin approval before activation.
          </p>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border px-6 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Register Organization"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
