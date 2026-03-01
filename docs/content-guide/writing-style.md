# Content Writing Style Guide

## Voice and Tone

Write as a **senior engineer mentoring a junior colleague**. The tone is:

- **Encouraging** — "You've got this" energy, never condescending
- **Practical** — Every concept connects to a real task they'll face on the job
- **Direct** — Short sentences, clear instructions, no unnecessary jargon
- **Honest** — Acknowledge when something is hard, share common mistakes

### Do

- Use second person ("you") — "You'll configure a load balancer"
- Use active voice — "Run the command" not "The command should be run"
- Start with why — Explain why something matters before how it works
- Use analogies — "Think of containers like shipping containers"
- Show, don't tell — Code examples over walls of text
- Admit complexity — "This is tricky. Here's why..."

### Don't

- Don't use "simply" or "just" — If it were simple, they wouldn't need the lesson
- Don't assume prior knowledge — Define terms on first use
- Don't write walls of text — Break up paragraphs (3-4 sentences max)
- Don't use passive voice — "The file is created" → "Create the file"
- Don't lecture — Teach through examples and exercises, not paragraphs
- Don't use gendered pronouns — Use "they" or "the engineer"

## Lesson Structure

Every lesson follows this structure:

### 1. Story Opener (Required)

Open with a `<Callout type="story">` that places the reader in a real scenario. This gives context for why the lesson matters.

**Good example:**
> You're on call for the first time. At 2 AM, your phone buzzes — the API is returning 500 errors. You SSH into the server and need to find the problem. Fast. Today, you'll learn the commands that will save you in moments like these.

**Bad example:**
> In this lesson, we will learn about Linux log files and how to read them.

### 2. Core Concepts (2-3 sections)

Teach the main ideas. Each section should have:
- A clear heading (`##`)
- Short explanation (3-5 paragraphs)
- At least one code example
- A callout for tips, warnings, or key facts

### 3. Hands-On Exercises (2-3 exercises)

Use `<Exercise>` components. Each exercise should:
- State the goal clearly
- Give specific instructions (numbered steps)
- Include starter code if needed
- Provide a `<CollapsibleSolution>` with explanation

### 4. Mini Project (Optional)

A `<MiniProject>` that combines all concepts. This should produce a tangible result the learner can keep.

### 5. Key Takeaways (Required)

3-5 bullet points summarizing the most important concepts. Use bold for key terms.

### 6. Quiz (Required)

3-5 `<QuizQuestion>` components. Mix question types:
- Concept understanding (what is X?)
- Practical application (what command does Y?)
- Decision-making (when would you use X vs Y?)

### 7. What's Next (Required)

One paragraph previewing the next lesson and connecting it to what they just learned.

## Code Examples

### Guidelines

- **Comment your code** — Every non-obvious line should have a comment
- **Show expected output** — Include what the learner should see
- **Use realistic values** — `my-app` not `foo`, `nginx.conf` not `test.txt`
- **Keep examples focused** — Show one concept per code block
- **Use language-specific blocks** — Always specify the language (```bash, ```python, etc.)

### Format

```bash
# Good: commented, realistic, shows output
# Create the project directory
mkdir -p ~/devops-project/config
cd ~/devops-project

# Create the configuration file
cat > config/nginx.conf << 'EOF'
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
}
EOF

# Verify the file was created
ls -la config/
# Expected output:
# -rw-r--r-- 1 user user 89 Mar  1 10:00 nginx.conf
```

```bash
# Bad: no comments, abstract values, no output
mkdir foo
cd foo
cat > bar.conf << 'EOF'
server {
    listen 80;
}
EOF
```

### Multi-Platform Code

Use `<TabGroup>` for platform-specific commands:

```mdx
<TabGroup>
<Tab label="Ubuntu/Debian">
sudo apt install nginx
</Tab>
<Tab label="CentOS/RHEL">
sudo dnf install nginx
</Tab>
<Tab label="macOS">
brew install nginx
</Tab>
</TabGroup>
```

## Callout Types

| Type | Use For | Example |
|------|---------|---------|
| `story` | Opening scenarios | Real-world situations that motivate the lesson |
| `info` | Key facts | Statistics, definitions, "good to know" info |
| `tip` | Best practices | Pro tips from experienced engineers |
| `warning` | Common mistakes | Things that will break or cause problems |

## Formatting

### Headings

- `##` for main sections (2-4 per lesson)
- `###` for subsections
- Never skip levels (no `##` → `####`)
- Use sentence case: "Setting up your environment" not "Setting Up Your Environment"

### Bold and Emphasis

- **Bold** for key terms on first introduction
- *Italics* sparingly, for emphasis only
- `Code formatting` for commands, file names, variable names, and config values

### Lists

- Use numbered lists for sequential steps
- Use bullet lists for non-sequential items
- Keep list items parallel in structure

### Tables

Use tables for comparisons. Always include a header row:

```markdown
| Tool | Purpose | When to Use |
|------|---------|-------------|
| grep | Search file contents | Finding text in logs |
| find | Search file names | Locating config files |
```

## Content Checklist

Before submitting a lesson, verify:

- [ ] Frontmatter is complete (title, description, order, xpReward, estimatedMinutes, prerequisites, objectives, tags)
- [ ] Description is under 160 characters (SEO)
- [ ] Lesson starts with a `<Callout type="story">`
- [ ] All code blocks have language specified
- [ ] All code examples are commented
- [ ] At least 2 exercises with solutions
- [ ] Key Takeaways section with 3-5 points
- [ ] Quiz with 3-5 questions
- [ ] "What's Next?" section
- [ ] No spelling errors
- [ ] All commands tested and working
- [ ] Content passes validation (`pnpm --filter @devops-engineers/content-validator start`)
- [ ] Estimated reading time is accurate
- [ ] XP reward matches complexity (15-50 XP)
