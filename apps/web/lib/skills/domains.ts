/**
 * Skill domain definitions — maps content paths to scoring domains.
 *
 * The platform tracks per-domain skill scores. Each content path
 * maps to one primary skill domain. The "troubleshooting" domain
 * is cross-cutting and fed by incident simulations across all paths.
 */

export interface SkillDomain {
  id: string;
  label: string;
  /** Content path slugs that feed into this domain */
  pathSlugs: string[];
}

export const SKILL_DOMAINS: SkillDomain[] = [
  { id: "linux", label: "Linux & Shell", pathSlugs: ["foundations"] },
  { id: "networking", label: "Networking", pathSlugs: ["foundations"] },
  { id: "containers", label: "Containers", pathSlugs: ["containerization"] },
  { id: "kubernetes", label: "Kubernetes", pathSlugs: ["platform-engineering"] },
  { id: "cicd", label: "CI/CD & GitOps", pathSlugs: ["cicd-gitops"] },
  { id: "iac", label: "Infrastructure as Code", pathSlugs: ["iac-cloud"] },
  { id: "observability", label: "Observability", pathSlugs: ["observability"] },
  { id: "troubleshooting", label: "Troubleshooting", pathSlugs: [] },
];

/** Map from path slug → domain id */
export const PATH_TO_DOMAIN: Record<string, string> = {
  foundations: "linux",
  containerization: "containers",
  "platform-engineering": "kubernetes",
  "cicd-gitops": "cicd",
  "iac-cloud": "iac",
  observability: "observability",
};

export function getDomainForPath(pathSlug: string): string | null {
  return PATH_TO_DOMAIN[pathSlug] ?? null;
}

export function getDomainLabel(domainId: string): string {
  return SKILL_DOMAINS.find((d) => d.id === domainId)?.label ?? domainId;
}
