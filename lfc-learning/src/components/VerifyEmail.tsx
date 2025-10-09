import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [code, setCode] = useState(Array(6).fill("")); // 6 separate digits
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0); // 🔹 countdown in seconds
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const email = params.get("email") || "";

  // 🔹 Trigger code sending immediately on page load
  useEffect(() => {
    if (email) {
      handleResend(true); // send code silently on mount
    }
  }, [email]);

  // 🔹 Join digits into a string
  const codeStr = code.join("");

  // 🔹 Auto-submit when 6 digits are filled
  useEffect(() => {
    if (codeStr.length === 6) {
      handleVerify();
    }
  }, [codeStr]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (codeStr.length < 6) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeStr }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid code.");
        return;
      }

      // ✅ Verified now, send to login
      navigate("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (silent = false) => {
    if (!silent) setResendMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (!silent) setResendMsg(data.message || "Failed to resend code.");
        return;
      }
      if (!silent) {
        setResendMsg("Verification code resent! (Check Spam folder if you don’t see it)");
        setCooldown(60); // 🔹 start 60s cooldown
      }
    } catch {
      if (!silent) setResendMsg("Failed to resend code. Try again.");
    }
  };

  // 🔹 Countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val)) return; // allow only digits
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);

    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleVerify}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Enter the 6-digit code sent to your email.
          {email.includes("gmail.com") && (
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-redCustom ml-1 underline"
            >
              (Click here if you used Gmail)
            </a>
          )}
        </p>

        {/* 6 Separate Inputs */}
        <div className="flex justify-between mb-4">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputsRef.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 border rounded-lg text-center text-xl focus:ring-2 focus:ring-goldCustom"
            />
          ))}
        </div>

        {error && <p className="text-redCustom text-sm mb-2">{error}</p>}
        {resendMsg && (
          <p className="text-sm text-center text-gray-600 mb-2">{resendMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-goldCustom w-full text-white py-2 px-4 rounded-lg mb-2"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          type="button"
          onClick={() => handleResend(false)}
          disabled={cooldown > 0}
          className={`text-sm w-full ${
            cooldown > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-redCustom hover:text-goldCustom"
          }`}
        >
          {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Code"}
        </button>
      </form>
    </div>
  );
}
