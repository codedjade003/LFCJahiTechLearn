import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";

interface PasswordCriteria {
  minLength: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function SignupForm() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);

  const navigate = useNavigate();

  const passwordCriteria = useMemo<PasswordCriteria>(() => ({
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const allCriteriaMet = useMemo(() => 
    Object.values(passwordCriteria).every(Boolean),
    [passwordCriteria]
  );

  const passwordsMatch = useMemo(() => 
    confirmPassword === "" || password === confirmPassword,
    [password, confirmPassword]
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!allCriteriaMet) {
      setError("Password does not meet all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
      className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] p-6 rounded-lg shadow-lg dark:shadow-[var(--shadow-xl)] max-w-md w-full border dark:border-[var(--border-primary)]"
    >
      <h3 className="text-xl font-semibold text-redCustom dark:text-[var(--lfc-red)] mb-4">
        Create a New Account
      </h3>

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 dark:text-[var(--text-secondary)] mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)] bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)]"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 dark:text-[var(--text-secondary)] mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)] bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)]"
        />
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="block text-gray-700 dark:text-[var(--text-secondary)] mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setShowPasswordCriteria(true);
          }}
          onFocus={() => setShowPasswordCriteria(true)}
          className="w-full px-3 py-2 border dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)] bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)]"
        />
      </div>

      {/* Password Criteria - Show when user starts typing */}
      {showPasswordCriteria && password && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-[var(--bg-tertiary)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] animate-in slide-in-from-top-2 duration-300">
          <p className="text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
            Password Requirements:
          </p>
          <div className="space-y-1">
            <PasswordCriteriaItem 
              met={passwordCriteria.minLength} 
              text="At least 8 characters" 
            />
            <PasswordCriteriaItem 
              met={passwordCriteria.hasUpperCase} 
              text="One uppercase letter" 
            />
            <PasswordCriteriaItem 
              met={passwordCriteria.hasNumber} 
              text="One number" 
            />
            <PasswordCriteriaItem 
              met={passwordCriteria.hasSpecialChar} 
              text="One special character (!@#$%^&*)" 
            />
          </div>
        </div>
      )}

      {/* Confirm Password - Only show after all criteria are met */}
      {allCriteriaMet && (
        <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
          <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-[var(--text-secondary)] mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] ${
              confirmPassword && !passwordsMatch
                ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-[var(--border-primary)] focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)]'
            }`}
          />
          {confirmPassword && !passwordsMatch && (
            <p className="text-red-500 text-xs mt-1 animate-in fade-in duration-200">
              Passwords do not match
            </p>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="text-green-500 dark:text-[var(--success)] text-xs mt-1 animate-in fade-in duration-200 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Passwords match
            </p>
          )}
        </div>
      )}

      {error && <p className="text-redCustom dark:text-[var(--error)] text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-goldCustom dark:bg-[var(--lfc-gold)] w-full text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 hover:bg-[var(--lfc-gold-hover)] transition-colors"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <p className="text-sm text-gray-600 dark:text-[var(--text-tertiary)] mt-4 text-center">
        Already have an account?{" "}
        <Link to="/" className="text-redCustom dark:text-[var(--lfc-red)] hover:text-goldCustom dark:hover:text-[var(--lfc-gold)] transition-colors">
          Login here
        </Link>
      </p>
    </form>
  );
}

function PasswordCriteriaItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center text-xs transition-all duration-300 ${
      met ? 'text-green-600 dark:text-[var(--success)]' : 'text-gray-500 dark:text-[var(--text-muted)]'
    }`}>
      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center transition-all duration-300 ${
        met ? 'bg-green-500 dark:bg-[var(--success)] scale-100' : 'bg-gray-300 dark:bg-gray-600 scale-90'
      }`}>
        {met && (
          <svg className="w-3 h-3 text-white animate-in zoom-in duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className={met ? 'font-medium' : ''}>{text}</span>
    </div>
  );
}
