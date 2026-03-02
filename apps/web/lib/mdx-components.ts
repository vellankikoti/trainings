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

  // Override standard HTML elements
  pre: (props: React.ComponentProps<"pre">) => {
    return React.createElement("pre", props);
  },
  table: (props: React.ComponentProps<"table">) => {
    return React.createElement(
      "div",
      { className: "my-4 overflow-x-auto" },
      React.createElement("table", { className: "w-full", ...props }),
    );
  },
};
