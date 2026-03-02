import React from "react";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { TabGroup, Tab } from "@/components/content/TabGroup";
import { Exercise } from "@/components/content/Exercise";
import { MiniProject } from "@/components/content/MiniProject";
import { CollapsibleSolution } from "@/components/content/CollapsibleSolution";
import { Quiz, QuizQuestion } from "@/components/content/Quiz";
import { LabEmbed } from "@/components/content/LabEmbed";
import { Terminal } from "@/components/content/Terminal";

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
  LabEmbed,
  Terminal,

  // Premium HTML element overrides
  h2: (props: React.ComponentProps<"h2">) => {
    return React.createElement(
      "h2",
      {
        ...props,
        className: "lesson-heading-h2",
      },
    );
  },
  h3: (props: React.ComponentProps<"h3">) => {
    return React.createElement(
      "h3",
      {
        ...props,
        className: "lesson-heading-h3",
      },
    );
  },
  pre: (props: React.ComponentProps<"pre">) => {
    return React.createElement("pre", props);
  },
  table: (props: React.ComponentProps<"table">) => {
    return React.createElement(
      "div",
      { className: "lesson-table-wrapper" },
      React.createElement("table", { ...props, className: "lesson-table" }),
    );
  },
  thead: (props: React.ComponentProps<"thead">) => {
    return React.createElement("thead", { ...props, className: "lesson-thead" });
  },
  th: (props: React.ComponentProps<"th">) => {
    return React.createElement("th", { ...props, className: "lesson-th" });
  },
  td: (props: React.ComponentProps<"td">) => {
    return React.createElement("td", { ...props, className: "lesson-td" });
  },
  tr: (props: React.ComponentProps<"tr">) => {
    return React.createElement("tr", { ...props, className: "lesson-tr" });
  },
  hr: () => {
    return React.createElement("div", { className: "lesson-divider" });
  },
  blockquote: (props: React.ComponentProps<"blockquote">) => {
    return React.createElement("blockquote", {
      ...props,
      className: "lesson-blockquote",
    });
  },
};
