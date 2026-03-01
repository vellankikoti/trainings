import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout } from "./Callout";

describe("Callout", () => {
  it("renders children content", () => {
    render(<Callout>Hello World</Callout>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(<Callout title="Custom Title">Content</Callout>);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders default title for info type", () => {
    render(<Callout type="info">Content</Callout>);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("renders default title for warning type", () => {
    render(<Callout type="warning">Content</Callout>);
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("renders default title for tip type", () => {
    render(<Callout type="tip">Content</Callout>);
    expect(screen.getByText("Tip")).toBeInTheDocument();
  });

  it("renders default title for story type", () => {
    render(<Callout type="story">Content</Callout>);
    expect(screen.getByText("Story Time")).toBeInTheDocument();
  });

  it("renders default title for danger type", () => {
    render(<Callout type="danger">Content</Callout>);
    expect(screen.getByText("Danger")).toBeInTheDocument();
  });

  it("applies correct border class for each type", () => {
    const { container, rerender } = render(<Callout type="info">Test</Callout>);
    expect(container.firstChild).toHaveClass("border-blue-500");

    rerender(<Callout type="warning">Test</Callout>);
    expect(container.firstChild).toHaveClass("border-yellow-500");

    rerender(<Callout type="tip">Test</Callout>);
    expect(container.firstChild).toHaveClass("border-green-500");

    rerender(<Callout type="story">Test</Callout>);
    expect(container.firstChild).toHaveClass("border-purple-500");
  });

  it("defaults to info type when no type provided", () => {
    const { container } = render(<Callout>Default</Callout>);
    expect(container.firstChild).toHaveClass("border-blue-500");
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("overrides default title with custom title", () => {
    render(<Callout type="warning" title="Watch Out">Content</Callout>);
    expect(screen.getByText("Watch Out")).toBeInTheDocument();
    expect(screen.queryByText("Warning")).not.toBeInTheDocument();
  });
});
