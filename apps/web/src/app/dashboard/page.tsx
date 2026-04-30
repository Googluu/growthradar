export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      <div style={{ fontSize: 48 }}>🚧</div>
      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontWeight: 800,
          fontSize: 32,
          color: "var(--txt)",
          letterSpacing: "-1px",
        }}
      >
        Dashboard EDA
      </h1>
      <p style={{ color: "var(--txt-muted)", fontSize: 15 }}>
        En construcción — próximamente: SERP · Labs · Keywords · OnPage
      </p>
    </main>
  );
}
