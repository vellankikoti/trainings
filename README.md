# DEVOPS ENGINEERS

**From Zero to Production-Ready — Training 1 Million Engineers**

The open-source platform that transforms anyone — regardless of background — into a production-ready DevOps, Cloud, and SRE engineer through story-driven, hands-on learning.

## What You'll Learn

| Path | Technologies |
|------|-------------|
| **Foundations** | Linux, Networking, Shell Scripting, Git |
| **Containerization** | Docker, Podman, Container Security |
| **Orchestration** | Kubernetes, Helm, Service Mesh |
| **Infrastructure as Code** | Terraform, Ansible, Pulumi |
| **CI/CD & Automation** | GitHub Actions, Jenkins, ArgoCD, GitOps |
| **Cloud & SRE** | AWS, GCP, Azure, Monitoring, Incident Response |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4 + ShadCN UI
- **Auth:** Clerk
- **Database:** Supabase (PostgreSQL)
- **Content:** MDX
- **Monorepo:** pnpm + Turborepo
- **Hosting:** Vercel

## Quick Start

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 9+ (`corepack enable && corepack prepare pnpm@latest --activate`)

### Setup

```bash
# Clone the repository
git clone https://github.com/vellankikoti/trainings.git
cd trainings

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Clerk and Supabase keys in .env.local

# Start development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run tests across all packages |
| `pnpm clean` | Remove build artifacts and node_modules |

## Project Structure

```
trainings/
├── apps/
│   └── web/              # Next.js application
│       ├── app/           # App Router pages & layouts
│       ├── components/    # React components
│       └── lib/           # Utilities & configuration
├── packages/
│   └── config/           # Shared ESLint & TypeScript configs
├── Git/                  # Git learning content (markdown)
├── Linux-Shell_Scripting/ # Linux & Shell Scripting content (markdown)
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml   # Workspace definition
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Submitting content fixes and improvements
- Adding new learning content
- Contributing code to the platform
- Reporting bugs and requesting features

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Community

Built with love by the DEVOPS ENGINEERS community. Our mission is to make world-class DevOps education accessible to everyone, everywhere.
