import Link from "next/link";

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 80% 10%, rgba(196,181,253,.42), transparent 34%), linear-gradient(145deg, #F7F8FD, #E7EBF8)",
      }}
    >
      <section
        style={{
          width: "min(420px, 100%)",
          padding: 32,
          borderRadius: 28,
          textAlign: "center",
          background: "rgba(255,255,255,.72)",
          border: "1px solid rgba(255,255,255,.9)",
          boxShadow: "0 26px 70px rgba(66,70,110,.16)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div style={{ fontSize: 42 }} aria-hidden>📝</div>
        <h1 style={{ margin: "12px 0 8px", color: "#18254B", fontSize: 28 }}>
          You&apos;re offline
        </h1>
        <p style={{ margin: 0, color: "#68708A", fontSize: 14, lineHeight: 1.6 }}>
          Notezy can reopen previously visited screens. Reconnect to sync your latest notes.
        </p>
        <Link
          href="/dashboard"
          style={{
            height: 44,
            marginTop: 22,
            padding: "0 18px",
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            color: "#FFFFFF",
            background: "linear-gradient(135deg, #8B5CF6, #6D4DE2)",
            fontSize: 13,
            fontWeight: 850,
            textDecoration: "none",
          }}
        >
          Try again
        </Link>
      </section>
    </main>
  );
}
