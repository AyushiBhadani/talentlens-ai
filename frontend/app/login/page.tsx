"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Firebase config — set these in your .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Demo mode: bypass Firebase if not configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_key_here") {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      localStorage.setItem("tl_user", JSON.stringify({ email, name: "Demo Recruiter", uid: "demo-user" }));
      toast.success("Welcome to TalentLens AI!");
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      localStorage.setItem("tl_token", token);
      localStorage.setItem("tl_user", JSON.stringify({ email: cred.user.email, name: cred.user.displayName, uid: cred.user.uid }));
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_key_here") {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      localStorage.setItem("tl_user", JSON.stringify({ email: "recruiter@company.com", name: "Demo Recruiter", uid: "demo-user" }));
      toast.success("Welcome to TalentLens AI!");
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken();
      localStorage.setItem("tl_token", token);
      localStorage.setItem("tl_user", JSON.stringify({ email: cred.user.email, name: cred.user.displayName, uid: cred.user.uid }));
      toast.success("Welcome to TalentLens AI!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-primary)" }}>
      {/* Left — Branding Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: "none",
          width: "45%",
          background: "linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)",
          padding: "48px",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
        className="md-show"
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 50%)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={22} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 20, color: "white" }}>TalentLens AI</span>
          </div>

          <h2 style={{ fontSize: 40, fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Find the right talent,<br />
            <span style={{ color: "#a5b4fc" }}>every time.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.7 }}>
            Semantic AI that understands resumes beyond keywords. Explain every decision. Reduce bias. Hire smarter.
          </p>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {[
            { icon: "🎯", text: "94% match accuracy vs 61% for keyword ATS" },
            { icon: "⚡", text: "Screen 100 resumes in minutes, not days" },
            { icon: "🛡️", text: "Anonymous mode reduces unconscious bias" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right — Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>TalentLens <span className="gradient-text">AI</span></span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 14 }}>
            Sign in to your hiring copilot. No account?{" "}
            <Link href="/register" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Create one free</Link>
          </p>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", marginBottom: 20, padding: "12px" }}
          >
            <Globe2 size={18} />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>or sign in with email</span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <form onSubmit={handleEmailLogin}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input"
                  style={{ paddingLeft: 40 }}
                  id="login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15 }}
              id="login-submit"
            >
              {loading ? (
                <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            Demo mode: enter any email & password to access the dashboard
          </p>
        </div>
      </motion.div>
    </div>
  );
}
