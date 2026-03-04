/**
 * Course visual configuration — gradient + icon for premium card banners.
 *
 * Uses Devicon `-original` variants (full-color brand SVGs) displayed in
 * a frosted-white container for crisp, eye-catching icons on gradient cards.
 */

export interface CourseVisual {
  /** Devicon CDN URL — prefer `-original` for colorful brand icons */
  iconUrl: string;
  /** Tailwind gradient classes for the card banner */
  gradient: string;
}

const D = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const COURSE_VISUALS: Record<string, CourseVisual> = {
  // ─── Foundations ────────────────────────────────────────────────────────
  linux: {
    iconUrl: `${D}/linux/linux-original.svg`,
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
  },
  "linux-admin": {
    iconUrl: `${D}/linux/linux-original.svg`,
    gradient: "from-[#2d3436] via-[#353b48] to-[#485460]",
  },
  "shell-scripting": {
    iconUrl: `${D}/bash/bash-original.svg`,
    gradient: "from-[#0d4b3c] via-[#116466] to-[#1a936f]",
  },
  networking: {
    iconUrl: `${D}/networkx/networkx-original.svg`,
    gradient: "from-[#0c2461] via-[#1e3799] to-[#4a69bd]",
  },
  git: {
    iconUrl: `${D}/git/git-original.svg`,
    gradient: "from-[#c0392b] via-[#e55039] to-[#f39c12]",
  },
  "python-automation": {
    iconUrl: `${D}/python/python-original.svg`,
    gradient: "from-[#2c3e50] via-[#2980b9] to-[#f1c40f]",
  },

  // ─── Containerization & Orchestration ──────────────────────────────────
  "docker-fundamentals": {
    iconUrl: `${D}/docker/docker-original.svg`,
    gradient: "from-[#0072c6] via-[#00a8e8] to-[#00d4ff]",
  },
  "docker-advanced": {
    iconUrl: `${D}/docker/docker-original.svg`,
    gradient: "from-[#1a1a6e] via-[#2541b2] to-[#0072c6]",
  },
  "kubernetes-fundamentals": {
    iconUrl: `${D}/kubernetes/kubernetes-original.svg`,
    gradient: "from-[#1a237e] via-[#283593] to-[#5c6bc0]",
  },
  "kubernetes-advanced": {
    iconUrl: `${D}/kubernetes/kubernetes-original.svg`,
    gradient: "from-[#0d1137] via-[#1a237e] to-[#e040fb]",
  },
  helm: {
    iconUrl: `${D}/helm/helm-original.svg`,
    gradient: "from-[#0c2461] via-[#1e3799] to-[#3c6382]",
  },
  kustomize: {
    iconUrl: `${D}/kubernetes/kubernetes-line-wordmark.svg`,
    gradient: "from-[#1b1464] via-[#3b3b98] to-[#6c5ce7]",
  },

  // ─── CI/CD & GitOps ───────────────────────────────────────────────────
  "cicd-fundamentals": {
    iconUrl: `${D}/gitlab/gitlab-original.svg`,
    gradient: "from-[#6f1d1b] via-[#99582a] to-[#bb3e03]",
  },
  "github-actions": {
    iconUrl: `${D}/githubactions/githubactions-original.svg`,
    gradient: "from-[#161b22] via-[#21262d] to-[#30363d]",
  },
  jenkins: {
    iconUrl: `${D}/jenkins/jenkins-original.svg`,
    gradient: "from-[#6f1d1b] via-[#a4133c] to-[#c9184a]",
  },
  "argocd-gitops": {
    iconUrl: `${D}/argocd/argocd-original.svg`,
    gradient: "from-[#e85d04] via-[#f48c06] to-[#faa307]",
  },

  // ─── IaC & Cloud ──────────────────────────────────────────────────────
  "terraform-fundamentals": {
    iconUrl: `${D}/terraform/terraform-original.svg`,
    gradient: "from-[#3c1874] via-[#5b2c8e] to-[#7b4baa]",
  },
  ansible: {
    iconUrl: `${D}/ansible/ansible-original.svg`,
    gradient: "from-[#1a1a1a] via-[#2d2d2d] to-[#4a4a4a]",
  },
  "cloud-fundamentals": {
    iconUrl: `${D}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
    gradient: "from-[#ff6f00] via-[#ff8f00] to-[#ffa000]",
  },
  "aws-core": {
    iconUrl: `${D}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
    gradient: "from-[#232f3e] via-[#ff9900] to-[#ffb84d]",
  },

  // ─── Observability & Reliability ──────────────────────────────────────
  "observability-fundamentals": {
    iconUrl: `${D}/grafana/grafana-original.svg`,
    gradient: "from-[#e65100] via-[#f57c00] to-[#ffb300]",
  },
  prometheus: {
    iconUrl: `${D}/prometheus/prometheus-original.svg`,
    gradient: "from-[#b71c1c] via-[#d32f2f] to-[#e57373]",
  },
  grafana: {
    iconUrl: `${D}/grafana/grafana-original.svg`,
    gradient: "from-[#e65100] via-[#ef6c00] to-[#f9a825]",
  },
  "sre-principles": {
    iconUrl: `${D}/google/google-original.svg`,
    gradient: "from-[#1565c0] via-[#1e88e5] to-[#42a5f5]",
  },

  // ─── Platform Engineering & Advanced ──────────────────────────────────
  "platform-principles": {
    iconUrl: `${D}/kubernetes/kubernetes-original.svg`,
    gradient: "from-[#311b92] via-[#4527a0] to-[#7c4dff]",
  },
  "security-devsecops": {
    iconUrl: `${D}/vault/vault-original.svg`,
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#533483]",
  },
  "career-development": {
    iconUrl: `${D}/linkedin/linkedin-original.svg`,
    gradient: "from-[#0a66c2] via-[#0077b5] to-[#00a0dc]",
  },
};

const DEFAULT_VISUAL: CourseVisual = {
  iconUrl: `${D}/devicon/devicon-original.svg`,
  gradient: "from-[#2d3436] via-[#636e72] to-[#b2bec3]",
};

/** Get visual config for a course by module slug. */
export function getCourseVisual(moduleSlug: string): CourseVisual {
  return COURSE_VISUALS[moduleSlug] ?? DEFAULT_VISUAL;
}
