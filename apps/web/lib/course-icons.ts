/**
 * Course icon + gradient mapping for premium card visuals.
 * Uses Devicon CDN (cdn.jsdelivr.net/gh/devicons/devicon) for
 * high-quality technology SVG icons.
 */

export interface CourseVisual {
  /** Devicon CDN URL for the technology icon */
  iconUrl: string;
  /** Tailwind gradient classes for the card banner */
  gradient: string;
  /** Fallback emoji if image fails to load */
  fallbackEmoji: string;
}

const DEVICON_BASE =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

/**
 * Map module slugs → visual config.
 * Every course gets a unique gradient + technology icon.
 */
const COURSE_VISUALS: Record<string, CourseVisual> = {
  // ─── Foundations ────────────────────────────────────────────────────────
  linux: {
    iconUrl: `${DEVICON_BASE}/linux/linux-original.svg`,
    gradient: "from-slate-800 to-slate-950",
    fallbackEmoji: "🐧",
  },
  "linux-admin": {
    iconUrl: `${DEVICON_BASE}/linux/linux-original.svg`,
    gradient: "from-slate-700 to-indigo-900",
    fallbackEmoji: "🖥️",
  },
  "shell-scripting": {
    iconUrl: `${DEVICON_BASE}/bash/bash-original.svg`,
    gradient: "from-emerald-700 to-emerald-900",
    fallbackEmoji: "📟",
  },
  networking: {
    iconUrl: `${DEVICON_BASE}/networkx/networkx-original.svg`,
    gradient: "from-cyan-600 to-blue-800",
    fallbackEmoji: "🌐",
  },
  git: {
    iconUrl: `${DEVICON_BASE}/git/git-original.svg`,
    gradient: "from-orange-500 to-red-700",
    fallbackEmoji: "🔀",
  },
  "python-automation": {
    iconUrl: `${DEVICON_BASE}/python/python-original.svg`,
    gradient: "from-blue-500 to-yellow-500",
    fallbackEmoji: "🐍",
  },

  // ─── Containerization & Orchestration ──────────────────────────────────
  "docker-fundamentals": {
    iconUrl: `${DEVICON_BASE}/docker/docker-original.svg`,
    gradient: "from-blue-500 to-blue-700",
    fallbackEmoji: "🐳",
  },
  "docker-advanced": {
    iconUrl: `${DEVICON_BASE}/docker/docker-original.svg`,
    gradient: "from-blue-600 to-indigo-800",
    fallbackEmoji: "🐳",
  },
  "kubernetes-fundamentals": {
    iconUrl: `${DEVICON_BASE}/kubernetes/kubernetes-original.svg`,
    gradient: "from-blue-600 to-violet-700",
    fallbackEmoji: "☸️",
  },
  helm: {
    iconUrl: `${DEVICON_BASE}/helm/helm-original.svg`,
    gradient: "from-blue-400 to-sky-700",
    fallbackEmoji: "⎈",
  },
  kustomize: {
    iconUrl: `${DEVICON_BASE}/kubernetes/kubernetes-original.svg`,
    gradient: "from-sky-500 to-indigo-700",
    fallbackEmoji: "🔧",
  },

  // ─── CI/CD & GitOps ───────────────────────────────────────────────────
  "cicd-fundamentals": {
    iconUrl: `${DEVICON_BASE}/githubactions/githubactions-original.svg`,
    gradient: "from-rose-500 to-red-700",
    fallbackEmoji: "🔄",
  },
  "github-actions": {
    iconUrl: `${DEVICON_BASE}/githubactions/githubactions-original.svg`,
    gradient: "from-slate-700 to-slate-900",
    fallbackEmoji: "⚡",
  },
  jenkins: {
    iconUrl: `${DEVICON_BASE}/jenkins/jenkins-original.svg`,
    gradient: "from-red-600 to-red-900",
    fallbackEmoji: "🏗️",
  },
  "argocd-gitops": {
    iconUrl: `${DEVICON_BASE}/argocd/argocd-original.svg`,
    gradient: "from-orange-400 to-rose-600",
    fallbackEmoji: "🔁",
  },

  // ─── IaC & Cloud ──────────────────────────────────────────────────────
  "terraform-fundamentals": {
    iconUrl: `${DEVICON_BASE}/terraform/terraform-original.svg`,
    gradient: "from-violet-600 to-purple-800",
    fallbackEmoji: "🏗️",
  },
  ansible: {
    iconUrl: `${DEVICON_BASE}/ansible/ansible-original.svg`,
    gradient: "from-slate-700 to-red-900",
    fallbackEmoji: "📦",
  },
  "cloud-fundamentals": {
    iconUrl: `${DEVICON_BASE}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
    gradient: "from-amber-500 to-orange-700",
    fallbackEmoji: "☁️",
  },

  // ─── Observability & Reliability ──────────────────────────────────────
  "observability-fundamentals": {
    iconUrl: `${DEVICON_BASE}/grafana/grafana-original.svg`,
    gradient: "from-amber-500 to-yellow-700",
    fallbackEmoji: "📊",
  },
  prometheus: {
    iconUrl: `${DEVICON_BASE}/prometheus/prometheus-original.svg`,
    gradient: "from-orange-500 to-red-600",
    fallbackEmoji: "🔥",
  },
  grafana: {
    iconUrl: `${DEVICON_BASE}/grafana/grafana-original.svg`,
    gradient: "from-amber-500 to-orange-600",
    fallbackEmoji: "📈",
  },
  "sre-principles": {
    iconUrl: `${DEVICON_BASE}/google/google-original.svg`,
    gradient: "from-blue-500 to-green-600",
    fallbackEmoji: "🛡️",
  },

  // ─── Platform Engineering & Advanced ──────────────────────────────────
  "platform-principles": {
    iconUrl: `${DEVICON_BASE}/kubernetes/kubernetes-original.svg`,
    gradient: "from-purple-600 to-indigo-800",
    fallbackEmoji: "🏛️",
  },
  "security-devsecops": {
    iconUrl: `${DEVICON_BASE}/vault/vault-original.svg`,
    gradient: "from-slate-700 to-slate-900",
    fallbackEmoji: "🔒",
  },
  "career-development": {
    iconUrl: `${DEVICON_BASE}/linkedin/linkedin-original.svg`,
    gradient: "from-blue-500 to-blue-700",
    fallbackEmoji: "🚀",
  },
};

/**
 * Default visual for unmapped modules.
 */
const DEFAULT_VISUAL: CourseVisual = {
  iconUrl: `${DEVICON_BASE}/devicon/devicon-original.svg`,
  gradient: "from-slate-600 to-slate-800",
  fallbackEmoji: "📚",
};

/**
 * Get the visual configuration for a course by its module slug.
 */
export function getCourseVisual(moduleSlug: string): CourseVisual {
  return COURSE_VISUALS[moduleSlug] ?? DEFAULT_VISUAL;
}
