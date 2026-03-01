# Discord Community Setup Guide

## Server Structure

### Categories & Channels

```
DEVOPS ENGINEERS
├── WELCOME
│   ├── #rules-and-guidelines
│   ├── #introductions
│   └── #announcements (admin-only posting)
│
├── GENERAL
│   ├── #general-chat
│   ├── #off-topic
│   ├── #career-advice
│   └── #job-board
│
├── LEARNING PATHS
│   ├── #foundations
│   ├── #containerization
│   ├── #cicd-gitops
│   ├── #infrastructure-as-code
│   ├── #cloud-native
│   └── #sre-operations
│
├── HELP & SUPPORT
│   ├── #linux-help
│   ├── #docker-help
│   ├── #kubernetes-help
│   ├── #terraform-help
│   ├── #ci-cd-help
│   └── #general-help
│
├── SHOWCASE
│   ├── #projects
│   ├── #certificates (share earned certs)
│   └── #blog-posts
│
├── VOICE
│   ├── Study Room 1
│   ├── Study Room 2
│   └── Office Hours
│
└── ADMIN (admin-only)
    ├── #mod-chat
    ├── #bot-logs
    └── #feedback
```

## Roles

| Role | Color | Permissions |
|------|-------|------------|
| Admin | Red | Full server management |
| Moderator | Orange | Manage messages, mute/kick |
| Content Creator | Purple | Post in #announcements |
| Mentor | Green | Help channels priority |
| Certified Engineer | Gold | Earned platform certificate |
| Learner | Blue | Default role for all members |

## Bot Setup

### Recommended Bots

1. **MEE6 or Carl-bot** — Welcome messages, auto-roles
   - Welcome message: "Welcome to DEVOPS ENGINEERS, {user}! Start by reading #rules-and-guidelines and introducing yourself in #introductions."
   - Auto-assign "Learner" role on join

2. **Dyno** — Moderation (auto-mod, warnings, logging)
   - Filter spam, links from new accounts
   - Log deleted messages to #bot-logs

3. **Ticket Tool** — Support tickets for complex issues

### Welcome Message Template

```
👋 Welcome to **DEVOPS ENGINEERS**, {user}!

We're building the world's largest open-source DevOps learning community.

**Getting Started:**
1. Read the rules in #rules-and-guidelines
2. Introduce yourself in #introductions
3. Pick your learning path at https://devopsengineer.com/paths
4. Ask questions in the relevant #help channel

**Useful Links:**
• Platform: https://devopsengineer.com
• GitHub: https://github.com/vellankikoti/trainings
• Contributing: https://devopsengineer.com/contributing

Happy learning! 🚀
```

## Community Guidelines

### Rules

1. **Be respectful** — No harassment, discrimination, or personal attacks
2. **Stay on topic** — Use the appropriate channel for your message
3. **No spam** — No self-promotion without permission, no repeated messages
4. **Help others** — Answer questions when you can, share knowledge
5. **No cheating** — Don't share quiz answers or assessment solutions
6. **English only** — Keep discussions in English for inclusivity
7. **No NSFW** — Keep content professional and family-friendly
8. **Credit sources** — When sharing code or resources, credit the original author

### Moderation Levels

| Offense | Action |
|---------|--------|
| First warning | Verbal warning via DM |
| Second warning | 24-hour mute |
| Third warning | 7-day mute |
| Severe violation | Immediate ban |
| Spam/bot | Immediate ban |

## Invite Strategy

### Where to Share

1. **Website** — Discord invite link in footer and community page
2. **Onboarding** — Prompt new users to join after sign-up
3. **Email** — Include Discord link in welcome email
4. **Lessons** — "Discuss this lesson" links in content
5. **Certificates** — Share certificate CTA includes Discord

### Invite Link Settings

- Use a permanent, non-expiring invite link
- Set to the #introductions channel
- Track invites with bot analytics

## Growth Milestones

| Members | Action |
|---------|--------|
| 100 | Assign first community moderators |
| 500 | Start weekly "Office Hours" voice sessions |
| 1,000 | Add regional channels (EU, Asia, Americas) |
| 5,000 | Add per-path study groups |
| 10,000 | Dedicated community manager |

## Integration with Platform

- Webhook notifications for new blog posts → #announcements
- Certificate earned notifications → #certificates
- New content releases → #announcements
- GitHub activity (PRs, issues) → #admin channel
