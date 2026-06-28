"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api";
import {
  Sparkles, ArrowLeft, Brain, FileText, Wand2, CheckCircle,
  ChevronRight, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const EXAMPLE_JD = `Senior Machine Learning Engineer

We are looking for a Senior Machine Learning Engineer to join our AI Platform team. You will design, build, and deploy machine learning systems at scale.

Requirements:
- 5+ years of experience in machine learning or data science
- Deep expertise in Python, PyTorch or TensorFlow
- Experience deploying ML models to production (Docker, Kubernetes)
- Strong understanding of NLP, deep learning, and statistical modeling
- Experience with MLOps tools (MLflow, Weights & Biases, or similar)
- Proficiency with cloud platforms (AWS, GCP, or Azure)
- Experience with large-scale data processing (Spark, Databricks)

Nice to have:
- PhD in ML, Computer Science, or related field
- Experience with transformer models and LLMs
- Contributions to open-source ML projects
- Leadership experience managing junior engineers

Responsibilities:
- Design and implement ML pipelines from research to production
- Collaborate with product teams to translate business problems into ML solutions
- Mentor junior engineers and establish best practices
- Drive technical roadmap for ML infrastructure

Location: Remote or San Francisco, CA
Type: Full-time | Salary: $180k–$240k`;

export default function NewJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [jdText, setJdText] = useState("");
  const [title, setTitle] = useState("");
  const [step, setStep] = useState<"input" | "analyzing" | "done">("input");

  const createMutation = useMutation({
    mutationFn: jobsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setStep("done");
      setTimeout(() => {
        router.push(`/dashboard/jobs/${data.id}`);
        toast.success("Job created and analyzed by AI!");
      }, 1500);
    },
    onError: (err: any) => {
      setStep("input");
      toast.error(err.message || "Failed to create job. Check your Gemini API key.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (jdText.trim().length < 50) {
      toast.error("Please paste a complete job description (at least 50 characters)");
      return;
    }
    setStep("analyzing");
    createMutation.mutate({ description_raw: jdText, title: title || undefined });
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard/jobs" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Jobs
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Create New Job
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Paste your job description — AI will extract skills, requirements, and hiring priorities automatically.
        </p>
      </div>

      {/* AI Analysis Steps */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 0 }}>
          {[
            { icon: FileText, label: "Paste JD", desc: "Raw description" },
            { icon: Brain, label: "AI Analysis", desc: "Gemini 2.0 Flash" },
            { icon: CheckCircle, label: "Structured", desc: "Ready to match" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", background: step === "done" || (step === "analyzing" && i < 2) || i === 0 ? "rgba(99,102,241,0.1)" : "var(--bg-tertiary)", border: `1px solid ${step === "done" || (step === "analyzing" && i < 2) || i === 0 ? "rgba(99,102,241,0.3)" : "var(--border)"}` }}>
                  <s.icon size={16} color={step === "done" || (step === "analyzing" && i < 2) || i === 0 ? "#6366f1" : "var(--text-muted)"} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.desc}</div>
              </div>
              {i < 2 && <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.form
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
          >
            {/* Optional title */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                Job Title (optional — AI will infer from JD)
              </label>
              <input
                className="input"
                placeholder="e.g. Senior ML Engineer"
                value={title}
                onChange={e => setTitle(e.target.value)}
                id="job-title-input"
              />
            </div>

            {/* JD Text area */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Job Description *</label>
                <button
                  type="button"
                  onClick={() => setJdText(EXAMPLE_JD)}
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  <Wand2 size={12} /> Load Example
                </button>
              </div>
              <textarea
                className="input"
                style={{ minHeight: 320, fontFamily: "inherit", fontSize: 13, lineHeight: 1.7 }}
                placeholder="Paste your complete job description here..."
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                id="job-description-input"
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{jdText.length} characters</span>
                {jdText.length < 50 && jdText.length > 0 && (
                  <span style={{ fontSize: 11, color: "#f43f5e" }}>Please add more details</span>
                )}
              </div>
            </div>

            {/* Info banner */}
            <div style={{ padding: "12px 16px", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 10, marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Sparkles size={15} color="#06b6d4" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong style={{ color: "#06b6d4" }}>AI will extract:</strong> Required & preferred skills, responsibilities, experience level, education, leadership expectations, domain, seniority, and hiring priorities.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15 }}
              id="analyze-job-btn"
            >
              <Brain size={18} /> Analyze with AI
            </button>
          </motion.form>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ padding: 64, textAlign: "center" }}
          >
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 40px rgba(99,102,241,0.3)", animation: "pulse-glow 2s ease-in-out infinite" }}>
              <Brain size={36} color="white" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Analyzing Job Description</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
              Gemini AI is extracting skills, priorities, and requirements...
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto" }}>
              {["Parsing job requirements", "Identifying required skills", "Extracting hiring priorities", "Generating AI summary"].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4 }}
                  style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--text-secondary)" }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin-slow 0.8s linear infinite", flexShrink: 0 }} />
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ padding: 64, textAlign: "center" }}
          >
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle size={36} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Analysis Complete!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Redirecting to your job details...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
