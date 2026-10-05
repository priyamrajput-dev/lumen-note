import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "2rem",
            textAlign: "center",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ⚠
          </div>

          <div style={{ maxWidth: "24rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h1
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--muted-foreground)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              An unexpected error occurred. Reloading usually fixes it.
            </p>
            {this.state.error && (
              <p
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted-foreground)",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                  margin: "0.25rem 0 0",
                  textAlign: "left",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={this.handleReload}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              height: 40,
              padding: "0 1.25rem",
              borderRadius: 100,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
