"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { jobsApi, matchingApi, reportsApi } from "@/lib/api";
import {
  Target, ChevronDown, ChevronUp, Brain, Shield, Download,
  AlertCircle, TrendingUp, Sparkles, Eye, FileText, ArrowRight,
  CheckCircle, XCircle, AlertTriangle, Zap
} from "lucide-react";
import { toast } from "sonner";

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{Math.round(score * 100)}%</span>
      </div>
      <div className="score-bar-track">
        <motion.div
          className={`score-bar-fill ${score > 0.7 ? "score-bar-excellent" : score > 0.5 ? "score-bar-good" : score > 0.3 ? "score-bar-fair" : "score-bar-poor"}`}
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function ScoreCircle({ score, size = 72 }: { score: number; size?: number }) {
  const pct = Math.round(score * 100);
  const color = score > 0.7 ? "#10b981" : score > 0.5 ? "#6366f1" : score > 0.3 ? "#f59e0b" : "#f43f5e";
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth={5} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size > 60 ? 18 : 14, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

function CandidateMatchCard({ item, rank, anonymous, jobId }: any) {
  const [expanded, setExpanded] = useState(false);
  const c = item.candidate;
  const scores = item.scores;
  const exp = item.explanation;

  const overallScore = scores.overall_score;
  const rankColor = rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7f32" : "var(--text-muted)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.06 }}
    >
      <div className="card" style={{ marginBottom: 12, overflow: "hidden", border: rank === 1 ? "1px solid rgba(245,158,11,0.3)" : undefined }}>
        {/* Main Row */}
        <div style={{ padding: "18px 24px", display: "flex", gap: 16, alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
          {/* Rank */}
          <div style={{ width: 32, textAlign: "center", fontWeight: 800, fontSize: 18, color: rankColor, flexShrink: 0 }}>
            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
          </div>

          {/* Avatar */}
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {(c.name || "?")[0].toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {c.total_years_experience ? `${c.total_years_experience}y exp` : "N/A"}
              {c.career_progression && ` · ${c.career_progression.slice(0, 60)}...`}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              {c.skills?.slice(0, 4).map((s: string) => (
                <span key={s} className="badge badge-muted" style={{ fontSize: 9 }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Score breakdown (mini) */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 120 }}>
              <ScoreBar label="Technical" score={scores.technical_score} color={scores.technical_score > 0.6 ? "#6366f1" : "#f59e0b"} />
              <div style={{ height: 8 }} />
              <ScoreBar label="Experience" score={scores.experience_score} color={scores.experience_score > 0.6 ? "#06b6d4" : "#f59e0b"} />
            </div>
            <ScoreCircle score={overallScore} size={68} />
          </div>

          {/* Expand */}
          <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}>
                <div style={{ paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

                  {/* All Score Bars */}
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Score Breakdown</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { label: "Technical Skills", score: scores.technical_score },
                        { label: "Experience", score: scores.experience_score },
                        { label: "Leadership", score: scores.leadership_score },
                        { label: "Education", score: scores.education_score },
                        { label: "Soft Skills", score: scores.soft_skills_score },
                        { label: "Growth Potential", score: scores.growth_potential_score },
                      ].map(({ label, score }) => (
                        <ScoreBar key={label} label={label} score={score} color={score > 0.6 ? "#6366f1" : score > 0.4 ? "#f59e0b" : "#f43f5e"} />
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Gaps */}
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#10b981" }}>✓ Strengths</h4>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                        {exp?.strengths?.slice(0, 3).map((s: string, i: number) => (
                          <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <CheckCircle size={11} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#f43f5e" }}>✗ Gaps</h4>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                        {exp?.missing_skills?.slice(0, 3).map((s: string, i: number) => (
                          <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <XCircle size={11} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />{s}
                          </li>
                        ))}
                        {exp?.transferable_skills?.slice(0, 2).map((s: string, i: number) => (
                          <li key={`t-${i}`} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <Zap size={11} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />{s} (transferable)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>AI Recommendation</h4>
                    <div style={{ padding: "12px 14px", background: "var(--bg-secondary)", borderRadius: 10, marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {exp?.overall_explanation || "Analysis pending."}
                      </p>
                    </div>
                    <div style={{ padding: "8px 12px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>
                        {exp?.recommendation || "Review required"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                      <Link href={`/dashboard/candidates/${c.id}`} style={{ flex: 1 }}>
                        <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: 11 }}>
                          <Eye size={12} /> Profile
                        </button>
                      </Link>
                      <button
                        onClick={() => reportsApi.downloadCandidate(c.id, jobId)}
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: "6px 10px" }}
                        title="Download PDF report"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MatchingPage() {
  const searchParams = useSearchParams();
  const preselectedJobId = searchParams.get("job") || "";

  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId);
  const [anonymous, setAnonymous] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [running, setRunning] = useState(false);

  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });

  useEffect(() => {
    if (preselectedJobId) setSelectedJobId(preselectedJobId);
  }, [preselectedJobId]);

  async function runMatching() {
    if (!selectedJobId) { toast.error("Please select a job first"); return; }
    setRunning(true);
    setResults(null);
    try {
      const data = await matchingApi.rankForJob(selectedJobId, anonymous);
      setResults(data);
      toast.success(`Ranked ${data.total} candidates!`);
    } catch (err: any) {
      toast.error(err.message || "Matching failed. Check API key and ensure candidates are uploaded.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
          AI Semantic Matching
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Select a job to rank all candidates using multi-dimensional semantic AI — not keyword matching.
        </p>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>Select Job</label>
            <select
              className="input"
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              id="matching-job-select"
            >
              <option value="">Choose a job...</option>
              {jobs?.map((j: any) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          {/* Bias Reduction Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: anonymous ? "rgba(16,185,129,0.08)" : "var(--bg-secondary)", border: `1px solid ${anonymous ? "rgba(16,185,129,0.3)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => setAnonymous(!anonymous)}
            id="bias-reduction-toggle"
          >
            <Shield size={16} color={anonymous ? "#10b981" : "var(--text-muted)"} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Bias Reduction</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Hide names & demographics</div>
            </div>
            <div style={{ width: 36, height: 20, borderRadius: 999, background: anonymous ? "#10b981" : "var(--border)", position: "relative", transition: "background 0.2s", marginLeft: 8, flexShrink: 0 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: anonymous ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
          </div>

          <button
            onClick={runMatching}
            disabled={!selectedJobId || running}
            className="btn btn-primary"
            style={{ padding: "12px 28px", fontSize: 14 }}
            id="run-matching-btn"
          >
            {running ? (
              <>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
                Matching...
              </>
            ) : (
              <><Target size={16} /> Run AI Matching</>
            )}
          </button>
        </div>
      </div>

      {/* Running State */}
      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card"
            style={{ padding: 48, textAlign: "center", marginBottom: 24 }}
          >
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 40px rgba(99,102,241,0.3)", animation: "pulse-glow 2s ease-in-out infinite" }}>
              <Brain size={32} color="white" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Running Semantic Matching</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Analyzing candidates with multi-dimensional AI scoring and generating explanations...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Results Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
                Results for: {results.job_title}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {results.total} candidates ranked · {anonymous ? "Anonymous mode active" : "Full profiles shown"}
              </p>
            </div>
            {anonymous && (
              <span className="badge badge-success">
                <Shield size={11} /> Bias Reduction Active
              </span>
            )}
          </div>

          {/* Candidate Cards */}
          {results.ranked_candidates.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: "center" }}>
              <AlertCircle size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-muted)" }}>No candidates to match. Upload resumes first.</p>
              <Link href="/dashboard/candidates" style={{ marginTop: 16, display: "inline-block" }}>
                <button className="btn btn-primary" style={{ fontSize: 13 }}><ArrowRight size={13} /> Upload Candidates</button>
              </Link>
            </div>
          ) : (
            results.ranked_candidates.map((item: any, i: number) => (
              <CandidateMatchCard
                key={item.candidate.id}
                item={item}
                rank={i + 1}
                anonymous={anonymous}
                jobId={selectedJobId}
              />
            ))
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!results && !running && (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <Target size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ready to Match</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Select a job above and click "Run AI Matching" to get semantically ranked candidates
          </p>
        </div>
      )}
    </div>
  );
}
