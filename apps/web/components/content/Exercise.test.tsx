import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Exercise } from "./Exercise";

describe("Exercise", () => {
  it("renders the title", () => {
    render(<Exercise title="Test Exercise">Content</Exercise>);
    expect(screen.getByText("Test Exercise")).toBeInTheDocument();
  });

  it("renders with exercise number", () => {
    render(<Exercise number={1} title="First Exercise">Content</Exercise>);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Exercise 1:");
    expect(heading).toHaveTextContent("First Exercise");
  });

  it("renders without exercise number", () => {
    render(<Exercise title="No Number">Content</Exercise>);
    expect(screen.queryByText(/Exercise \d:/)).not.toBeInTheDocument();
  });

  it("renders children content", () => {
    render(<Exercise title="Test">Hello World</Exercise>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("starts as not completed", () => {
    render(<Exercise title="Test">Content</Exercise>);
    const button = screen.getByRole("button", { name: /mark as complete/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveTextContent("✓");
  });

  it("toggles completion on click", () => {
    render(<Exercise title="Test">Content</Exercise>);
    const button = screen.getByRole("button", { name: /mark as complete/i });

    fireEvent.click(button);
    expect(button).toHaveTextContent("✓");
    expect(screen.getByRole("button", { name: /mark as incomplete/i })).toBeInTheDocument();

    fireEvent.click(button);
    expect(button).not.toHaveTextContent("✓");
    expect(screen.getByRole("button", { name: /mark as complete/i })).toBeInTheDocument();
  });
});
