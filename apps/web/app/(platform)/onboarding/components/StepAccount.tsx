"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StepAccountProps {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  publicProfile: boolean;
  onPublicProfileChange: (value: boolean) => void;
}

export function StepAccount({
  displayName,
  onDisplayNameChange,
  publicProfile,
  onPublicProfileChange,
}: StepAccountProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Set Up Your Profile</h2>
        <p className="mt-2 text-muted-foreground">
          How would you like to appear on the platform?
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          {/* Display Name */}
          <div>
            <label
              htmlFor="display-name"
              className="block text-sm font-medium text-foreground"
            >
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="How should we call you?"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={100}
            />
          </div>

          {/* Profile Visibility */}
          <div>
            <p className="text-sm font-medium text-foreground">
              Profile Visibility
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Public profiles show your skills and badges to others
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => onPublicProfileChange(true)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  publicProfile
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    publicProfile ? "border-primary" : "border-border"
                  }`}
                >
                  {publicProfile && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <span className="font-medium">Public</span>
                  <span className="ml-2 text-muted-foreground">
                    — Show my skills and progress
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onPublicProfileChange(false)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  !publicProfile
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    !publicProfile ? "border-primary" : "border-border"
                  }`}
                >
                  {!publicProfile && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <span className="font-medium">Private</span>
                  <span className="ml-2 text-muted-foreground">
                    — Keep my progress hidden
                  </span>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
