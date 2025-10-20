import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const { setUser, fetchUser } = useAuth();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  // Check if user just verified email
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("✅ Email verified successfully! You can now login.");
    }
  }, [searchParams]);

  const updateStreak = async (token: string) => {
    try {
      await fetch(`${API_BASE}/api/stats/streak`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
    } catch (err) {
      console.error("Failed to update streak:", err);
      // Don't throw error here - streak update shouldn't block login
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle blacklisted users
        if (res.status === 403 && data.isBlacklisted) {
          setError(`Access denied: ${data.reason || "Your account has been restricted."}`);
          return;
        }
        
        if (data.message === "User not found") {
          setError("Account not found. Please register.");
        } else if (data.message === "EMAIL_NOT_VERIFIED") {
          navigate(`/verify-email?email=${encodeURIComponent(data.email || email)}`);
          return;
        } else {
          setError(data.message || "Login failed. Please try again.");
        }
        return;
      }

      // ✅ Save token + metadata
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("firstLogin", JSON.stringify(data.firstLogin));
      localStorage.setItem("isOnboarded", JSON.stringify(data.isOnboarded));
      localStorage.setItem("isVerified", JSON.stringify(data.isVerified));

      if (!data.isVerified) {
        setError("Your email is not verified. Please verify it and try again.");
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1000);
        return;
      }

      // 🔹 Update streak immediately after successful login
      await updateStreak(data.token);

      // 🔹 Update context
      if (data.user) {
        setUser(data.user);
      } else {
        await fetchUser(); // fallback to API
      }

      // ✅ Handle onboarding first
      if (data.firstLogin) {
        navigate("/onboarding");
      } else if (!data.isOnboarded) {
        navigate("/dashboard");
      } else {
        // ✅ Normal dashboard access
        if (data.role === "admin" || data.role === "admin-only") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="bg-white dark:bg-[var(--bg-elevated)] p-6 rounded-lg shadow-lg dark:shadow-[var(--shadow-xl)] max-w-md w-full border border-gray-200 dark:border-[var(--border-primary)]">
      <h3 className="text-xl font-semibold text-redCustom dark:text-[var(--lfc-red)] mb-4">Login to Your Account</h3>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)] bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)]"
        />
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)] bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)]"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-lfc-red border-gray-300 dark:border-gray-600 rounded focus:ring-lfc-red"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Remember me
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
              className="w-4 h-4 text-lfc-red border-gray-300 dark:border-gray-600 rounded focus:ring-lfc-red"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Stay signed in
            </span>
          </label>
        </div>
        <Link to="/forgot-password" className="text-sm text-redCustom dark:text-[var(--lfc-red)] hover:text-goldCustom dark:hover:text-[var(--lfc-gold)] transition-colors">
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-redCustom dark:text-[var(--error)] text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 dark:text-[var(--success)] text-sm mb-4">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-goldCustom dark:bg-[var(--lfc-gold)] w-full text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 hover:bg-[var(--lfc-gold-hover)] transition-colors"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
