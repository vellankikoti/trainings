"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Section name shown in the error message */
  section?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary for individual dashboard sections.
 * Catches rendering errors and shows a compact fallback
 * so other sections continue to work.
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="text-sm font-medium text-destructive">
            Failed to load {this.props.section ?? "this section"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try refreshing the page. If the problem persists, contact support.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
