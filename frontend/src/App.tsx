import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

/* ---------------- AUTH PAGE (LOGIN + SIGNUP) ---------------- */

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ NEW
  const [message, setMessage] = useState("");

  // If already logged in, go to dashboard
  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    } else {
      setCheckedAuth(true); // allow auth page to render
    }
  }, [navigate]);

  if (!checkedAuth) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === "signup") {
      // ✅ SIGNUP FLOW WITH CONFIRM PASSWORD + AUTO-LOGIN
      if (!email || !password || !confirmPassword) {
        setMessage("Please fill all fields.");
        return;
      }

      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      setMessage("Creating account and logging you in...");

      try {
        // 1) Register the user
        const signupRes = await fetch("http://127.0.0.1:8000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const signupData = await signupRes.json();

        if (!signupRes.ok) {
          setMessage(signupData.detail || "Signup failed");
          return;
        }

        // 2) Auto-login after successful signup
        const loginRes = await fetch("http://127.0.0.1:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          setMessage(loginData.detail || "Account created, but login failed.");
          return;
        }

        // 3) Save token and go to dashboard
        localStorage.setItem("cc_token", loginData.access_token);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Signup error:", error);
        setMessage("Error connecting to server");
      }

      return;
    }

    // ✅ LOGIN FLOW (existing users)
    setMessage("Logging in...");

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("cc_token", data.access_token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Error connecting to server");
    }
  }

  function handleForgotPassword() {
    alert(
      "For this project, password reset is not implemented.\nPlease contact the admin to reset."
    );
  }

  const isLogin = mode === "login";

  return (
    <div className="app-root">
      <div className="login-card">
        <h1 className="login-title">Career Compass</h1>
        <p className="login-subtitle">
          {isLogin ? "Login to your dashboard" : "Create a new account"}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* User ID / Email */}
          <div className="form-group">
            <label className="form-label">User ID / Email</label> {/* ✅ CHANGED */}
            <input
              type="email"
              placeholder="you@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password fields */}
          {isLogin ? (
            // ✅ LOGIN: single password field
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              {/* SIGNUP: New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* SIGNUP: Confirm New Password */}
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter the password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {isLogin && (
            <div className="form-row">
              <label className="form-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <span className="form-forgot" onClick={handleForgotPassword}>
                Forgot?
              </span>
            </div>
          )}

          <button type="submit" className="login-button">
            {isLogin ? "Login" : "Sign up"}
          </button>
        </form>

        {/* Switch between login / signup */}
        <p className="login-footer">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <span
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setMode("login");
                  setMessage("");
                  setConfirmPassword("");
                }}
              >
                Login
              </span>
            </>
          )}
        </p>

        {message && (
          <p
            style={{
              marginTop: 10,
              fontSize: 12,
              textAlign: "center",
              color: "#a3e635",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- ROUTES ---------------- */

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
