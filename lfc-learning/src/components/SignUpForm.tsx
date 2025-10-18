import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignupForm() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // Clear any existing tokens/data before signup
      localStorage.clear();
      sessionStorage.clear();
      
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      // Navigate after signup - backend doesn't return token on register
      // User must verify email first, then login
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
    >
      <h3 className="text-xl font-semibold text-redCustom mb-4">
        Create a New Account
      </h3>

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom"
        />
      </div>

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

      {error && <p className="text-redCustom-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-goldCustom w-full text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <p className="text-sm text-gray-600 mt-4 text-center">
        Already have an account?{" "}
        <Link to="/" className="text-redCustom hover:text-goldCustom">
          Login here
        </Link>
      </p>
    </form>
  );
}
