import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

const CONTENT_DIR = path.join(process.cwd(), "..", "..", "content", "paths");

export interface LessonFrontmatter {
  title: string;
  description: string;
  order: number;
  xpReward?: number;
  estimatedMinutes?: number;
  prerequisites?: string[];
  objectives?: string[];
  tags?: string[];
  /** Short bullet-point takeaways shown in a card at the bottom of the lesson and inside the completion modal */
  key_takeaways?: string[];
  /** A reflective question shown in the completion modal to deepen learning */
  reflection_prompt?: string;
}

export interface CompiledLesson {
  frontmatter: LessonFrontmatter;
  source: MDXRemoteSerializeResult;
  headings: { depth: number; text: string; id: string }[];
}

function extractHeadings(
  content: string,
): { depth: number; text: string; id: string }[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: { depth: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ depth, text, id });
  }

  return headings;
}

export async function getLesson(
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<CompiledLesson | null> {
  const lessonDir = path.join(CONTENT_DIR, pathSlug, moduleSlug, lessonSlug);

  // Try index.mdx first, then index.md
  let filePath = path.join(lessonDir, "index.mdx");
  if (!fs.existsSync(filePath)) {
    filePath = path.join(lessonDir, "index.md");
  }
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as LessonFrontmatter;
  const headings = extractHeadings(content);

  const source = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          { behavior: "wrap" },
        ],
        [
          rehypePrettyCode as any,
          {
            theme: { dark: "one-dark-pro", light: "github-light" },
            keepBackground: false,
          },
        ],
      ],
    },
    parseFrontmatter: false,
  });

  return { frontmatter, source, headings };
}

export function getLessonSlugs(
  pathSlug: string,
  moduleSlug: string,
): string[] {
  const moduleDir = path.join(CONTENT_DIR, pathSlug, moduleSlug);
  if (!fs.existsSync(moduleDir)) return [];

  return fs
    .readdirSync(moduleDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => {
      const indexMdx = path.join(moduleDir, e.name, "index.mdx");
      const indexMd = path.join(moduleDir, e.name, "index.md");
      return fs.existsSync(indexMdx) || fs.existsSync(indexMd);
    })
    .map((e) => e.name);
}
