import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { TabGroup, Tab } from "@/components/content/TabGroup";
import { Exercise } from "@/components/content/Exercise";
import { MiniProject } from "@/components/content/MiniProject";
import { CollapsibleSolution } from "@/components/content/CollapsibleSolution";
import { Quiz, QuizQuestion } from "@/components/content/Quiz";

export const mdxComponents = {
  // Custom components for MDX content
  CodeBlock,
  Callout,
  TabGroup,
  Tab,
  Exercise,
  MiniProject,
  CollapsibleSolution,
  Quiz,
  QuizQuestion,

  // Override standard HTML elements
  pre: (props: React.ComponentProps<"pre">) => {
    // rehype-pretty-code wraps code in pre > code, pass through
    return props as any;
  },
  table: (props: React.ComponentProps<"table">) => {
    const { ...rest } = props;
    return {
      type: "div",
      props: {
        className: "my-4 overflow-x-auto",
        children: { type: "table", props: { className: "w-full", ...rest } },
      },
    } as any;
  },
};
