"use client";

import { useState } from "react";
import Link from "next/link";

interface CandidateSearchProps {
  orgId: string;
}

interface Candidate {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_level: number;
  current_streak: number;
  location_city: string | null;
  location_country: string | null;
  availability: string | null;
  bio: string | null;
  skills: { domain: string; composite_score: number }[];
}

export function CandidateSearch({ orgId }: CandidateSearchProps) {
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (skills.trim()) params.set("skills", skills.trim());
    if (location.trim()) params.set("location_city", location.trim());
    if (availability) params.set("availability", availability);

    try {
      const res = await fetch(
        `/api/organizations/${orgId}/candidates?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setCandidates(data.candidates);
      setTotal(data.total);
    } catch {
      setCandidates([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const shortlist = async (candidateId: string) => {
    await fetch(`/api/organizations/${orgId}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        interaction_type: "shortlisted",
      }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="rounded-lg border border-border p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="linux, docker, kubernetes"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="City name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="open">Open to opportunities</option>
              <option value="looking">Actively looking</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={search}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {total} candidate(s) found
          </p>
          {candidates.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No candidates match your criteria. Try broadening your search.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {c.avatar_url ? (
                        <img
                          src={c.avatar_url}
                          alt=""
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {(c.display_name ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">
                          {c.display_name ?? "Unknown"}
                        </p>
                        {c.username && (
                          <Link
                            href={`/u/${c.username}`}
                            className="text-xs text-primary hover:underline"
                          >
                            @{c.username}
                          </Link>
                        )}
                        {c.bio && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {c.bio}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {c.location_city && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {c.location_city}
                              {c.location_country && `, ${c.location_country}`}
                            </span>
                          )}
                          {c.availability &&
                            c.availability !== "not_specified" && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                {c.availability === "open"
                                  ? "Open to opportunities"
                                  : "Actively looking"}
                              </span>
                            )}
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                            Lv {c.current_level} &middot;{" "}
                            {c.total_xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => shortlist(c.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      Shortlist
                    </button>
                  </div>
                  {c.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.skills.map((s) => (
                        <span
                          key={s.domain}
                          className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {s.domain}: {s.composite_score}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
