# MDX Component Reference

Quick reference for all available MDX components in lesson content.

## Callout

Available types: `info`, `tip`, `warning`, `story`

```mdx
<Callout type="info" title="Optional Title">
Content here. Supports **markdown** inside.
</Callout>
```

## TabGroup / Tab

For platform-specific or multi-option instructions:

```mdx
<TabGroup>
<Tab label="Tab 1">
Content for tab 1.
</Tab>
<Tab label="Tab 2">
Content for tab 2.
</Tab>
</TabGroup>
```

## Exercise

Numbered, hands-on exercises with optional collapsible solutions:

```mdx
<Exercise number={1} title="Exercise Title">
Instructions for the exercise.

<CollapsibleSolution>
The solution with explanation.
</CollapsibleSolution>
</Exercise>
```

## MiniProject

Larger guided project combining multiple concepts:

```mdx
<MiniProject title="Project Title">
Step-by-step project instructions with code blocks.
</MiniProject>
```

## Quiz / QuizQuestion

End-of-lesson knowledge check. `answer` is zero-indexed:

```mdx
<Quiz>
<QuizQuestion
  question="Your question?"
  options={["Option A", "Option B", "Option C", "Option D"]}
  answer={1}
  explanation="Why Option B is correct."
/>
</Quiz>
```

## LabEmbed

Link to a hands-on lab environment:

```mdx
<LabEmbed
  labId="lab-slug"
  title="Lab Title"
  description="What the lab covers."
/>
```

## Code Blocks

Standard fenced code blocks with language syntax highlighting:

````mdx
```bash
echo "Hello World"
```

```python
print("Hello World")
```

```yaml
key: value
list:
  - item1
  - item2
```
````

Supported languages: bash, python, javascript, typescript, yaml, json, dockerfile, hcl, go, ruby, sql, nginx, toml, ini, xml, html, css.

## Tables

Standard markdown tables:

```mdx
| Column A | Column B | Column C |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
```

## Frontmatter Fields

Every lesson MDX file must have these frontmatter fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Lesson title (also used in navigation) |
| description | string | Yes | SEO-friendly summary, under 160 chars |
| order | number | Yes | Position within the module (1-based) |
| xpReward | number | Yes | XP awarded on completion (typically 25) |
| estimatedMinutes | number | Yes | Expected time to complete |
| prerequisites | string[] | Yes | Slugs of prerequisite lessons (can be empty) |
| objectives | string[] | Yes | Learning objectives (3-5 items) |
| tags | string[] | Yes | Topic tags for filtering |

## Lesson Structure Guidelines

1. **Story Callout** — Open with a relatable scenario
2. **Core Concepts** (2-3 sections) — Theory with examples
3. **Hands-On Exercises** (2-3) — Practice with solutions
4. **Mini Project** (optional) — Combines all concepts
5. **Key Takeaways** — 3-5 bullet points
6. **Quiz** — 3-5 questions testing understanding
7. **What's Next** — Preview of the next lesson
