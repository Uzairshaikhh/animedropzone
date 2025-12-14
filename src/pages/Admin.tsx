export function AdminPage() {
  console.log("AdminPage component is rendering");
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "bold",
      }}
    >
      <div
        style={{
          backgroundColor: "#333",
          padding: "40px",
          borderRadius: "10px",
          border: "2px solid #9333ea",
        }}
      >
        <h1 style={{ color: "#9333ea", marginBottom: "20px" }}>ADMIN PANEL TEST</h1>
        <p style={{ color: "#ccc" }}>If you can see this, the admin panel is working!</p>
        <p style={{ color: "#ff6b6b", marginTop: "20px" }}>Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
