// src/pages/ForgotPassword.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

interface PasswordCriteria {
  minLength: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

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
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const codeStr = code.join("");

  const passwordCriteria = useMemo<PasswordCriteria>(() => ({
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }), [newPassword]);

  const allCriteriaMet = useMemo(() => 
    Object.values(passwordCriteria).every(Boolean),
    [passwordCriteria]
  );

  const passwordsMatch = useMemo(() => 
    confirmPassword === "" || newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

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
    
    if (!allCriteriaMet) {
      setError("Password does not meet all requirements.");
      return;
    }
    
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
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-gray-500 dark:text-[var(--text-tertiary)] hover:text-goldCustom dark:hover:text-[var(--lfc-gold)] transition-colors"
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
        className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] p-6 rounded-lg shadow-md dark:shadow-[var(--shadow-xl)] w-full max-w-md border dark:border-[var(--border-primary)]"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-[var(--text-primary)]">
          {step === "request"
            ? "Forgot Password"
            : step === "code"
            ? "Enter Reset Code"
            : "Set New Password"}
        </h2>

        {message && <p className="text-green-600 dark:text-[var(--success)] text-sm mb-3 text-center">{message}</p>}
        {error && <p className="text-red-500 dark:text-[var(--error)] text-sm mb-3 text-center">{error}</p>}

        {step === "request" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)]"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-goldCustom dark:bg-[var(--lfc-gold)] w-full text-white hover:bg-[var(--lfc-gold-hover)] transition-colors py-2 px-4 rounded-lg"
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
                  className="w-12 h-12 border dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] text-center text-xl focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)]"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || codeStr.length < 6}
              className="bg-goldCustom dark:bg-[var(--lfc-gold)] w-full text-white hover:bg-[var(--lfc-gold-hover)] transition-colors py-2 px-4 rounded-lg mb-2"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => handleRequestCode(false)}
              disabled={cooldown > 0}
              className={`text-sm w-full ${
                cooldown > 0
                  ? "text-gray-400 dark:text-[var(--text-muted)] cursor-not-allowed"
                  : "text-redCustom dark:text-[var(--lfc-red)] hover:text-goldCustom dark:hover:text-[var(--lfc-gold)] transition-colors"
              }`}
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Code"}
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="mb-2">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setShowPasswordCriteria(true);
                }}
                onFocus={() => setShowPasswordCriteria(true)}
                className="w-full p-3 border dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)]"
                required
              />
            </div>

            {/* Password Criteria */}
            {showPasswordCriteria && newPassword && (
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
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 border rounded-lg bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 dark:border-[var(--border-primary)] focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)]'
                  }`}
                  required
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

            <button
              type="submit"
              disabled={loading || !allCriteriaMet || !passwordsMatch}
              className="bg-goldCustom dark:bg-[var(--lfc-gold)] w-full text-white py-2 px-4 rounded-lg hover:bg-[var(--lfc-gold-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
        <p className="text-center text-sm mt-4">
          <a
            href="/"
            className="text-redCustom dark:text-[var(--lfc-red)] hover:text-goldCustom dark:hover:text-[var(--lfc-gold)] transition-colors underline"
          >
            Go back to homepage
          </a>
        </p>
      </form>
    </div>
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
