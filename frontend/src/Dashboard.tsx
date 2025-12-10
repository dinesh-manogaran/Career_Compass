// frontend/src/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type MatchResultType = {
  score: number;
  rating: string;
  matched_skills: string[];
  missing_skills: string[];
  gaps: string[];
  tip: string;
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function Dashboard() {
  const navigate = useNavigate();

  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [matchResult, setMatchResult] = useState<MatchResultType | null>(null);
  const [matchMessage, setMatchMessage] = useState("");
  const [matchPercent, setMatchPercent] = useState(0);

  const [careerQuestion, setCareerQuestion] = useState("");
  const [careerAnswer, setCareerAnswer] = useState("");
  const [careerLoading, setCareerLoading] = useState(false);

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("cc_token");
    navigate("/", { replace: true });
  }

  // Update animated match percentage
  useEffect(() => {
    if (matchResult) {
      const percent = Math.round((matchResult.score / 10) * 100);
      const clamped = Math.max(0, Math.min(100, percent));
      setMatchPercent(clamped);
    } else {
      setMatchPercent(0);
    }
  }, [matchResult]);

  function getBarColor(percent: number) {
    if (percent < 40) return "#ef4444"; // red
    if (percent < 70) return "#f59e0b"; // amber
    return "#22c55e"; // green
  }

  async function handleAnalyzeMatch() {
    setMatchResult(null);

    if (!jdFile || !resumeFile) {
      setMatchMessage("Please upload both Job Description and Resume files.");
      return;
    }

    const token = localStorage.getItem("cc_token");
    if (!token) {
      setMatchMessage("Session expired. Please login again.");
      navigate("/", { replace: true });
      return;
    }

    setMatchMessage("Uploading and analyzing documents...");

    try {
      const formData = new FormData();
      formData.append("jd_file", jdFile);
      formData.append("resume_file", resumeFile);

      const res = await fetch("http://127.0.0.1:8000/analyze_match_upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send JWT here
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMatchMessage(data.detail || "Failed to analyze uploaded files.");
        return;
      }

      const data: MatchResultType = await res.json();
      setMatchResult(data);
      setMatchMessage("");
    } catch (err) {
      console.error(err);
      setMatchMessage("Error connecting to server.");
    }
  }

  async function handleCareerQuery() {
    if (!careerQuestion.trim()) {
      setCareerAnswer("Please type a question first 🙂");
      return;
    }

    setCareerAnswer("");
    setCareerLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/career_query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: careerQuestion }),
      });

      if (!res.ok) {
        setCareerAnswer("Could not get an answer.");
        return;
      }

      const data: { answer: string } = await res.json();
      setCareerAnswer(data.answer || "No answer received.");
    } catch (err) {
      console.error(err);
      setCareerAnswer("Error connecting to server.");
    } finally {
      setCareerLoading(false);
    }
  }

  // Pie chart data
  const matchedCount = matchResult ? matchResult.matched_skills.length : 0;
  const missingCount = matchResult ? matchResult.missing_skills.length : 0;
  const totalSkills = matchedCount + missingCount;
  const matchedPercentForPie =
    totalSkills > 0 ? Math.round((matchedCount / totalSkills) * 100) : 0;
  const missingPercentForPie = totalSkills > 0 ? 100 - matchedPercentForPie : 0;

  const pieBackground =
    totalSkills > 0
      ? `conic-gradient(#22c55e 0% ${matchedPercentForPie}%, #ef4444 ${matchedPercentForPie}% 100%)`
      : "#e5e7eb";

  return (
    <div style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1>Career Compass Dashboard</h1>
          <p>
            Upload your Job Description and Resume (PDF / DOCX / TXT) to analyze
            how well they match.
          </p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Match Analyzer Section */}
      <section
        style={{
          marginTop: 20,
          padding: 16,
          border: "1px solid #333",
          borderRadius: 8,
        }}
      >
        <h2>Job–Resume Match Analyzer</h2>

        {/* File Uploads */}
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {/* JD Upload */}
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Job Description (PDF / Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;

                if (file.size > MAX_FILE_SIZE_BYTES) {
                  alert(`Job Description file must be less than ${MAX_FILE_SIZE_MB} MB`);
                  e.target.value = "";
                  setJdFile(null);
                  return;
                }

                setJdFile(file);
              }}
              style={{ marginTop: 6, marginBottom: 4 }}
            />
            <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>
              Max size: {MAX_FILE_SIZE_MB} MB
            </p>
            {jdFile && (
              <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                Selected: <em>{jdFile.name}</em>
              </p>
            )}
          </div>

          {/* Resume Upload */}
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Your Resume (PDF / Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;

                if (file.size > MAX_FILE_SIZE_BYTES) {
                  alert(`Resume file must be less than ${MAX_FILE_SIZE_MB} MB`);
                  e.target.value = "";
                  setResumeFile(null);
                  return;
                }

                setResumeFile(file);
              }}
              style={{ marginTop: 6, marginBottom: 4 }}
            />
            <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>
              Max size: {MAX_FILE_SIZE_MB} MB
            </p>
            {resumeFile && (
              <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                Selected: <em>{resumeFile.name}</em>
              </p>
            )}
          </div>
        </div>

        <button style={{ marginTop: 12 }} onClick={handleAnalyzeMatch}>
          Analyze Match
        </button>

        {matchMessage && <p style={{ marginTop: 8 }}>{matchMessage}</p>}

        {/* Results */}
        {matchResult && (
          <div style={{ marginTop: 20 }}>
            {/* Animated Match Score Bar */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 500 }}>Match Score</span>
                <span>{matchPercent}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 14,
                  borderRadius: 999,
                  background: "#e5e7eb",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${matchPercent}%`,
                    height: "100%",
                    borderRadius: "inherit",
                    transition: "width 0.6s ease",
                    background: getBarColor(matchPercent),
                  }}
                />
              </div>
              <p style={{ marginTop: 8, fontSize: 14 }}>
                Score: <b>{matchResult.score}/10</b> – {matchResult.rating}
              </p>
            </div>

            {/* Pie Chart for Skill Gap */}
            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {/* Pie */}
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: pieBackground,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {totalSkills > 0 ? `${matchedPercentForPie}%` : "No skills"}
              </div>

              {/* Legend + Counts */}
              <div style={{ fontSize: 14 }}>
                <h4 style={{ marginBottom: 8 }}>Skill Gap Overview</h4>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#22c55e",
                      marginRight: 8,
                    }}
                  />
                  <span>
                    <b>Matched Skills:</b> {matchedCount}{" "}
                    {totalSkills > 0 && `(${matchedPercentForPie}%)`}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "#ef4444",
                      marginRight: 8,
                    }}
                  />
                  <span>
                    <b>Missing Skills:</b> {missingCount}{" "}
                    {totalSkills > 0 && `(${missingPercentForPie}%)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <p>
              <strong>Matched Skills:</strong>{" "}
              {matchResult.matched_skills.length
                ? matchResult.matched_skills.join(", ")
                : "None detected explicitly."}
            </p>

            <p>
              <strong>Missing Skills from JD:</strong>{" "}
              {matchResult.missing_skills.length
                ? matchResult.missing_skills.join(", ")
                : "Your resume covers most key skills from the JD."}
            </p>

            <div>
              <strong>Gap Analysis:</strong>
              <ul>
                {matchResult.gaps.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>

            <p>
              <strong>Tip:</strong> {matchResult.tip}
            </p>
          </div>
        )}
      </section>

      {/* Career Q&A (Gemini) */}
      <section
        style={{
          marginTop: 20,
          padding: 16,
          border: "1px solid #333",
          borderRadius: 8,
        }}
      >
        <h2>Career Q&A (AI)</h2>
        <p>Ask anything about skills, careers, roles, or learning paths.</p>

        <textarea
          style={{ width: "100%", minHeight: 80 }}
          value={careerQuestion}
          onChange={(e) => setCareerQuestion(e.target.value)}
          placeholder="Example: I'm an ECE student. How can I prepare for a software developer role?"
        />

        <button
          style={{ marginTop: 8 }}
          onClick={handleCareerQuery}
          disabled={careerLoading}
        >
          {careerLoading ? "Thinking..." : "Ask"}
        </button>

        {careerAnswer && (
          <div
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 8,
              background: "#eef2ff",
              color: "#111827",
              border: "1px solid #c7d2fe",
            }}
          >
            <strong style={{ color: "#1e3a8a" }}>Answer:</strong>
            <p
              style={{
                whiteSpace: "pre-wrap",
                marginTop: 6,
                lineHeight: 1.6,
              }}
            >
              {careerAnswer}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
