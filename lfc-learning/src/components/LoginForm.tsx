import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser, fetchUser } = useAuth();

  const navigate = useNavigate();

  const updateStreak = async (token: string) => {
    try {
      await fetch("http://localhost:5000/api/stats/streak", {
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
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
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
    <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-xl font-semibold text-redCustom mb-4">Login to Your Account</h3>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom"
        />
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="block text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom"
        />
      </div>

      <div className="mb-4 text-right">
        <Link to="/forgot-password" className="text-sm text-redCustom hover:text-goldCustom">
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-redCustom text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-goldCustom w-full text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
