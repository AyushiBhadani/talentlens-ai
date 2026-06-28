"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Mail, Lock, User, ArrowRight, Eye, EyeOff, Building } from "lucide-react";
import { toast } from "sonner";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (getApps().length === 0) return initializeApp(firebaseConfig);
  return getApps()[0];
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Demo mode
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_key_here") {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      localStorage.setItem("tl_user", JSON.stringify({ email: form.email, name: form.name, uid: "demo-user" }));
      toast.success("Account created! Welcome to TalentLens AI!");
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      const token = await cred.user.getIdToken();
      localStorage.setItem("tl_token", token);
      localStorage.setItem("tl_user", JSON.stringify({ email: cred.user.email, name: form.name, uid: cred.user.uid }));
      toast.success("Account created! Welcome to TalentLens AI!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg-primary)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 440 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>TalentLens <span className="gradient-text">AI</span></span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Create your account</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>

        <form onSubmit={handleRegister}>
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith", icon: User },
            { label: "Work Email", key: "email", type: "email", placeholder: "jane@company.com", icon: Mail },
            { label: "Company (optional)", key: "company", type: "text", placeholder: "Acme Corp", icon: Building },
          ].map(({ label, key, type, placeholder, icon: Icon }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>{label}</label>
              <div style={{ position: "relative" }}>
                <Icon size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="input"
                  style={{ paddingLeft: 40 }}
                  id={`register-${key}`}
                />
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="input"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                id="register-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15 }}
            id="register-submit"
          >
            {loading ? (
              <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 20 }}>
          By creating an account, you agree to our{" "}
          <a href="#" style={{ color: "#6366f1", textDecoration: "none" }}>Terms</a> and{" "}
          <a href="#" style={{ color: "#6366f1", textDecoration: "none" }}>Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
