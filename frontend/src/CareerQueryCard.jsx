import { useState } from "react";

function CareerQueryCard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    setError("");
    setAnswer("");

    if (!question.trim()) {
      setError("Please type a question first 🙂");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/career_query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Server error");
      }

      const data = await res.json();
      setAnswer(data.answer || "No answer received.");
    } catch (err) {
      console.error("Career query error:", err);
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setAnswer("");
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "1.5rem auto",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        background: "#ffffff",
      }}
    >
      <h2 style={{ marginBottom: "0.75rem" }}>🎯 Career Compass – AI Assistant</h2>
      <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#555" }}>
        Ask anything about your career, skills, resume, or placements.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Example: I am an ECE final-year student. What skills should I learn to get a software job?"
        rows={4}
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          resize: "vertical",
          fontSize: "0.95rem",
        }}
      />

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button
          onClick={handleAsk}
          disabled={loading}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
            background: loading ? "#999" : "#2563eb",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {loading ? "Thinking…" : "Ask AI"}
        </button>

        <button
          onClick={handleClear}
          type="button"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            cursor: "pointer",
            background: "#f9fafb",
            flexShrink: 0,
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <p style={{ marginTop: "0.75rem", color: "red", fontSize: "0.9rem" }}>
          ⚠️ {error}
        </p>
      )}

      {answer && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.9rem",
            borderRadius: "8px",
            background: "#f3f4ff",
            fontSize: "0.95rem",
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>AI Answer:</strong>
          <br />
          {answer}
        </div>
      )}
    </div>
  );
}

export default CareerQueryCard;
