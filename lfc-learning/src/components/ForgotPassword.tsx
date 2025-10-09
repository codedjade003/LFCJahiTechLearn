// src/pages/ForgotPassword.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function ForgotPassword() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [step, setStep] = useState<"request" | "code" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill("")); // 6-digit code
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const codeStr = code.join("");

  // Handle requesting code
  const handleRequestCode = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setMessage(null);
        setError(null);
      }
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setStep("code");
      if (!silent) setCooldown(60); // start cooldown only if user clicked
    } catch (err: any) {
      if (!silent) {
        setError(err.response?.data?.message || "Error requesting reset code");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Handle verifying code and moving to password reset step
  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (codeStr.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError(null);
    setStep("reset");
  };

  // Handle resetting password
  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const res = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email,
        code: codeStr,
        newPassword,
      });
      setMessage(res.data.message);

      // ✅ redirect to home/login page after short delay
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle code input
  const handleChange = (val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val)) return; // digits only
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
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-gray-500 hover:text-goldCustom"
      >
        <FiArrowLeft size={20} />
      </button>
      <form
        onSubmit={
          step === "request"
            ? (e) => {
                e.preventDefault();
                handleRequestCode(false);
              }
            : step === "code"
            ? handleVerifyCode
            : handleResetPassword
        }
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {step === "request"
            ? "Forgot Password"
            : step === "code"
            ? "Enter Reset Code"
            : "Set New Password"}
        </h2>

        {message && <p className="text-green-600 text-sm mb-3 text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        {step === "request" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-goldCustom"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-goldCustom w-full text-white py-2 px-4 rounded-lg"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>
        )}

        {step === "code" && (
          <>
            <div className="flex justify-between mb-4">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
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

            <button
              type="submit"
              disabled={loading || codeStr.length < 6}
              className="bg-goldCustom w-full text-white py-2 px-4 rounded-lg mb-2"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => handleRequestCode(false)}
              disabled={cooldown > 0}
              className={`text-sm w-full ${
                cooldown > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-redCustom hover:text-goldCustom"
              }`}
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Code"}
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-goldCustom"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-goldCustom"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-redCustom w-full text-white py-2 px-4 rounded-lg"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
        <p className="text-center text-sm mt-4">
          <a
            href="/"
            className="text-redCustom hover:text-goldCustom underline"
          >
            Go back to homepage
          </a>
        </p>
      </form>
    </div>
  );
}
