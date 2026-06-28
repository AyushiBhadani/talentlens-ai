"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Key, Shield, Eye, Bell, User, Save, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [firebaseConfig, setFirebaseConfig] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    toast.success("Settings saved — update your .env file with these values");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Configure your TalentLens AI workspace</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* API Configuration */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key size={18} color="#6366f1" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>AI Configuration</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Set in your backend <code style={{ fontSize: 12, background: "var(--bg-tertiary)", padding: "1px 6px", borderRadius: 4 }}>.env</code> file</p>
            </div>
          </div>

          <div style={{ padding: "16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <strong>⚠️ Important:</strong> API keys must be set in your <code>backend/.env</code> file for security.
              Never expose keys in the frontend. The backend reads them at startup.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                Gemini API Key <span style={{ color: "#f43f5e" }}>*</span>
                <a href="https://aistudio.google.com" target="_blank" style={{ marginLeft: 8, color: "#6366f1", fontSize: 11 }}>
                  Get free key <ExternalLink size={10} />
                </a>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  id="settings-gemini-key"
                />
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Add as <code>GEMINI_API_KEY=your_key</code> in backend/.env
              </p>
            </div>
          </div>
        </div>

        {/* Bias Reduction */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Bias Reduction</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Control what information is hidden during evaluation</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Hide candidate names", desc: "Replaces name with anonymous ID", default: true },
              { label: "Hide profile photos", desc: "Removes any photo references", default: true },
              { label: "Hide location details", desc: "Hides city, country, and address", default: false },
              { label: "Hide education institution", desc: "Shows degree but not school name", default: false },
            ].map(({ label, desc, default: on }, i) => {
              const [enabled, setEnabled] = useState(on);
              return (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>
                  </div>
                  <div
                    onClick={() => setEnabled(!enabled)}
                    style={{ width: 40, height: 22, borderRadius: 999, background: enabled ? "#10b981" : "var(--border)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: enabled ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup Guide */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Setup Guide</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { step: "1", title: "Get Gemini API Key", desc: "Visit aistudio.google.com → Get API Key → Create free key", url: "https://aistudio.google.com" },
              { step: "2", title: "Configure Backend", desc: 'Copy backend/.env.example to backend/.env and add GEMINI_API_KEY=your_key' },
              { step: "3", title: "Setup Firebase (optional)", desc: "For real auth: create Firebase project → enable Email/Password auth → add config to frontend/.env.local" },
              { step: "4", title: "Start the App", desc: "Run the startup scripts in the project root" },
            ].map(({ step, title, desc, url }) => (
              <div key={step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#6366f1", flexShrink: 0 }}>
                  {step}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{desc}</div>
                  {url && <a href={url} target="_blank" style={{ fontSize: 12, color: "#6366f1", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}>Open {url.split("//")[1]} <ExternalLink size={11} /></a>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "13px" }} id="save-settings-btn">
          {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
