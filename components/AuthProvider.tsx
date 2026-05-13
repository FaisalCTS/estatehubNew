"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/types";

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  openSignIn: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "register">("signin");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ data }) => setUser(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  function openSignIn() {
    resetForm("signin");
    setModalOpen(true);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  function resetForm(m: "signin" | "register") {
    setMode(m);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setShowPwd(false);
    setFormError(null);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "signin"
      ? { email, password }
      : { name, email, phone, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(typeof json.error === "string" ? json.error : "Something went wrong.");
      } else {
        setUser(json.data);
        closeModal();
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, openSignIn, logout }}>
      {children}

      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>

            {/* Logo + heading */}
            <div className="mb-6">
              <p className="text-xs font-bold text-brand-accent tracking-widest uppercase mb-1">EstateHub</p>
              <h2 className="text-2xl font-bold text-brand-primary">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-brand-muted mt-1">
                {mode === "signin"
                  ? "Sign in to continue to EstateHub"
                  : "Join EstateHub — free forever"}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="flex border-b border-gray-200 mb-6 -mx-1">
              {(["signin", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => resetForm(m)}
                  className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition ${
                    mode === m
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-brand-muted hover:text-brand-ink"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ravi Kumar"
                    required
                    autoComplete="name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                />
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-1">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-brand-muted select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="9876543210"
                      required
                      autoComplete="tel"
                      className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Minimum 8 characters" : "Your password"}
                    required
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted hover:text-brand-ink font-medium"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-primary hover:bg-brand-accent text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? mode === "signin"
                    ? "Signing in…"
                    : "Creating account…"
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            <p className="text-center text-xs text-brand-muted mt-5">
              {mode === "signin" ? (
                <>
                  New to EstateHub?{" "}
                  <button
                    onClick={() => resetForm("register")}
                    className="text-brand-accent font-semibold hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => resetForm("signin")}
                    className="text-brand-accent font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
