"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { candidatesApi, jobsApi, matchingApi } from "@/lib/api";
import { GitCompare, ChevronRight, Brain, CheckCircle, XCircle, Trophy, Users, Award } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

function ScoreBar({ label, scoreA, scoreB }: { label: string; scoreA: number; scoreB: number }) {
  const colorA = "#6366f1";
  const colorB = "#06b6d4";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
        <span style={{ fontWeight: 700, color: colorA }}>{Math.round(scoreA * 100)}%</span>
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontWeight: 700, color: colorB }}>{Math.round(scoreB * 100)}%</span>
      </div>
      <div style={{ position: "relative", height: 6, background: "var(--bg-tertiary)", borderRadius: 999, overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: colorA, borderRadius: 999 }}
          initial={{ width: 0 }} animate={{ width: `${scoreA * 50}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
        <motion.div style={{ position: "absolute", right: 0, top: 0, height: "100%", background: colorB, borderRadius: 999 }}
          initial={{ width: 0 }} animate={{ width: `${scoreB * 50}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [candidateAId, setCandidateAId] = useState("");
  const [candidateBId, setCandidateBId] = useState("");
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [running, setRunning] = useState(false);

  const { data: candidates } = useQuery({ queryKey: ["candidates"], queryFn: candidatesApi.list });
  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });

  async function runComparison() {
    if (!candidateAId || !candidateBId) { toast.error("Please select two candidates"); return; }
    if (candidateAId === candidateBId) { toast.error("Please select two different candidates"); return; }
    setRunning(true);
    setResult(null);
    try {
      const data = await matchingApi.compare(candidateAId, candidateBId, jobId || undefined);
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Comparison failed");
    } finally {
      setRunning(false);
    }
  }

  const radarData = result ? [
    { subject: "Technical", A: Math.round(result.candidate_a.scores.technical_score * 100), B: Math.round(result.candidate_b.scores.technical_score * 100) },
    { subject: "Experience", A: Math.round(result.candidate_a.scores.experience_score * 100), B: Math.round(result.candidate_b.scores.experience_score * 100) },
    { subject: "Leadership", A: Math.round(result.candidate_a.scores.leadership_score * 100), B: Math.round(result.candidate_b.scores.leadership_score * 100) },
    { subject: "Education", A: Math.round(result.candidate_a.scores.education_score * 100), B: Math.round(result.candidate_b.scores.education_score * 100) },
    { subject: "Growth", A: Math.round(result.candidate_a.scores.growth_potential_score * 100), B: Math.round(result.candidate_b.scores.growth_potential_score * 100) },
    { subject: "Soft Skills", A: Math.round(result.candidate_a.scores.soft_skills_score * 100), B: Math.round(result.candidate_b.scores.soft_skills_score * 100) },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Candidate Comparison</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>AI-powered side-by-side comparison with radar analysis</p>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "flex-end" }}>
          {[
            { label: "Candidate A", value: candidateAId, set: setCandidateAId, color: "#6366f1", id: "compare-a-select" },
            { label: "Candidate B", value: candidateBId, set: setCandidateBId, color: "#06b6d4", id: "compare-b-select" },
          ].map(({ label, value, set, color, id }) => (
            <div key={label}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block", color }}>{label}</label>
              <select className="input" value={value} onChange={e => set(e.target.value)} id={id}>
                <option value="">Select candidate...</option>
                {(candidates || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name || c.anonymous_id}</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>For Job (optional)</label>
            <select className="input" value={jobId} onChange={e => setJobId(e.target.value)} id="compare-job-select">
              <option value="">General comparison</option>
              {(jobs || []).map((j: any) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={runComparison}
            disabled={!candidateAId || !candidateBId || running}
            className="btn btn-primary"
            style={{ padding: "12px 20px" }}
            id="run-comparison-btn"
          >
            {running ? (
              <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
            ) : (
              <><GitCompare size={16} /> Compare</>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Winner Banner */}
            {result.comparison.winner !== "Tie" && (
              <div style={{ marginBottom: 20, padding: "16px 24px", background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.05))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, display: "flex", gap: 14, alignItems: "center" }}>
                <Trophy size={24} color="#f59e0b" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {result.comparison.winner === "A" ? result.candidate_a.name : result.candidate_b.name} is the stronger candidate
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{result.comparison.winner_reasoning}</div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, marginBottom: 20 }}>
              {/* Candidate A */}
              <CandidateColumn candidate={result.candidate_a} label="Candidate A" color="#6366f1" advantages={result.comparison.candidate_a_advantages} gaps={result.comparison.candidate_a_gaps} />

              {/* Radar Chart */}
              <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 280 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Radar Comparison</h3>
                <ResponsiveContainer width={240} height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <Radar name="A" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                    <Radar name="B" dataKey="B" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: "#6366f1" }} /> {result.candidate_a.name}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: "#06b6d4" }} /> {result.candidate_b.name}</div>
                </div>

                {/* Score Bars */}
                <div style={{ width: "100%", marginTop: 20 }}>
                  {[
                    { label: "Technical", scoreA: result.candidate_a.scores.technical_score, scoreB: result.candidate_b.scores.technical_score },
                    { label: "Experience", scoreA: result.candidate_a.scores.experience_score, scoreB: result.candidate_b.scores.experience_score },
                    { label: "Leadership", scoreA: result.candidate_a.scores.leadership_score, scoreB: result.candidate_b.scores.leadership_score },
                    { label: "Growth", scoreA: result.candidate_a.scores.growth_potential_score, scoreB: result.candidate_b.scores.growth_potential_score },
                  ].map(props => <ScoreBar key={props.label} {...props} />)}
                </div>
              </div>

              {/* Candidate B */}
              <CandidateColumn candidate={result.candidate_b} label="Candidate B" color="#06b6d4" advantages={result.comparison.candidate_b_advantages} gaps={result.comparison.candidate_b_gaps} />
            </div>

            {/* AI Summary */}
            {result.comparison.summary && (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Brain size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", marginBottom: 6 }}>AI COMPARISON SUMMARY</div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{result.comparison.summary}</p>
                    {result.comparison.recommendation && (
                      <div style={{ marginTop: 12, padding: "8px 14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#6366f1", display: "inline-block" }}>
                        {result.comparison.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !running && (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <GitCompare size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Compare Two Candidates</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Select two candidates above to generate an AI-powered comparison</p>
        </div>
      )}
    </div>
  );
}

function CandidateColumn({ candidate, label, color, advantages, gaps }: any) {
  return (
    <div className="card" style={{ padding: 24, borderTop: `3px solid ${color}` }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 20, margin: "0 auto 10px" }}>
          {(candidate.name || "?")[0].toUpperCase()}
        </div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{candidate.name}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{candidate.total_years_experience}y exp</div>
        <div style={{ fontSize: 30, fontWeight: 800, color, marginTop: 12 }}>
          {Math.round(candidate.scores.overall_score * 100)}%
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Overall Match</div>
      </div>

      {advantages?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 8 }}>ADVANTAGES</div>
          {advantages.slice(0, 3).map((a: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
              <CheckCircle size={12} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} /> {a}
            </div>
          ))}
        </div>
      )}
      {gaps?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f43f5e", marginBottom: 8 }}>GAPS</div>
          {gaps.slice(0, 2).map((g: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
              <XCircle size={12} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} /> {g}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
