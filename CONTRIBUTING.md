# Contributing to DEVOPS ENGINEERS

Thank you for your interest in contributing to the DEVOPS ENGINEERS platform! Whether you're fixing a typo, adding a new lesson, or building a feature, every contribution helps train the next generation of DevOps engineers.

## Types of Contributions

### 1. Content Contributions

**Fixing existing content** — typos, outdated commands, broken links, clarity improvements.

**Adding new content** — new lessons, exercises, lab instructions, or entire modules.

Content lives in markdown files organized by technology:
- `Git/` — Git and GitHub content
- `Linux-Shell_Scripting/` — Linux administration and shell scripting

#### Content Guidelines

- Write in a mentor voice — friendly, encouraging, and clear
- Use real-world examples over abstract theory
- Include hands-on exercises with expected outputs
- Test all commands and code snippets before submitting
- Follow the existing file naming conventions

### 2. Code Contributions

**Bug fixes** — fixing issues in the web platform.

**Features** — implementing new platform functionality.

The web application lives in `apps/web/` and uses Next.js 14 with TypeScript.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trainings.git
   cd trainings
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Make your changes
6. Verify your changes:
   ```bash
   pnpm lint        # Check for lint errors
   pnpm type-check  # Check for type errors
   pnpm build       # Ensure production build succeeds
   ```
7. Commit your changes with a clear message:
   ```bash
   git commit -m "feat: add Docker networking lesson"
   ```
8. Push and open a Pull Request

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature or content
- `fix:` — bug fix or content correction
- `docs:` — documentation changes
- `style:` — formatting, no code change
- `refactor:` — code restructuring
- `test:` — adding or updating tests
- `chore:` — build process, dependencies, tooling

## Pull Request Process

1. Fill out the PR template completely
2. Ensure all CI checks pass
3. Request review from a maintainer
4. Address review feedback
5. Once approved, a maintainer will merge your PR

## Code Standards

- TypeScript strict mode — no `any` types
- Format with Prettier (runs automatically)
- Follow existing patterns and conventions
- Write meaningful variable and function names
- Keep components focused and composable

## Reporting Issues

Use the [GitHub Issues](https://github.com/vellankikoti/trainings/issues) tab with the appropriate template:

- **Bug Report** — something is broken
- **Content Fix** — incorrect or outdated content
- **Content Request** — request a new topic or lesson
- **Feature Request** — suggest a platform feature

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to providing a welcoming and inclusive experience for everyone.

## Questions?

Open a [Discussion](https://github.com/vellankikoti/trainings/discussions) or reach out to the maintainers.

Thank you for helping us train 1 million DevOps engineers!
