"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f7f6f3" }}>
        <main style={{ maxWidth: 430, margin: "0 auto", padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>G$ Path failed to load</h1>
          <p style={{ color: "#6b6b6b", fontSize: 14 }}>
            Restart the dev server from <code>apps/web</code> with{" "}
            <code>pnpm dev</code>.
          </p>
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              fontSize: 11,
              overflow: "auto",
              background: "#efeeeb",
              borderRadius: 8,
            }}
          >
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 20,
              padding: "12px 20px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
