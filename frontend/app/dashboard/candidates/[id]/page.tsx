"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { candidatesApi, reportsApi } from "@/lib/api";
import {
  ArrowLeft, Award, Code, BookOpen, Briefcase, Zap, TrendingUp,
  AlertTriangle, GitBranch, Link2, Mail, Phone, MapPin, Download,
  CheckCircle, Shield, Star, Clock
} from "lucide-react";

function ScoreSection({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{Math.round(score * 100)}%</span>
      </div>
      <div className="score-bar-track">
        <motion.div
          className={`score-bar-fill ${score > 0.7 ? "score-bar-excellent" : score > 0.5 ? "score-bar-good" : score > 0.3 ? "score-bar-fair" : "score-bar-poor"}`}
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => candidatesApi.get(id),
  });

  if (isLoading) return <div style={{ padding: 40, textAlign: "center" }}>
    <div style={{ width: 32, height: 32, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite", margin: "0 auto" }} />
  </div>;

  if (!candidate || candidate.detail) return null;

  const riskLevel = candidate.fraud_risk_score < 0.2 ? "Low" : candidate.fraud_risk_score < 0.5 ? "Medium" : "High";
  const riskColor = candidate.fraud_risk_score < 0.2 ? "#10b981" : candidate.fraud_risk_score < 0.5 ? "#f59e0b" : "#f43f5e";

  return (
    <div>
      {/* Header */}
      <Link href="/dashboard/candidates" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Candidates
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 28, boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
            {(candidate.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>{candidate.name || candidate.anonymous_id}</h1>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {candidate.email && <a href={`mailto:${candidate.email}`} style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 5, alignItems: "center", textDecoration: "none" }}><Mail size={12} />{candidate.email}</a>}
              {candidate.phone && <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 5, alignItems: "center" }}><Phone size={12} />{candidate.phone}</span>}
              {candidate.location && <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 5, alignItems: "center" }}><MapPin size={12} />{candidate.location}</span>}
              {candidate.linkedin_url && <a href={candidate.linkedin_url} target="_blank" style={{ color: "#6366f1" }}><Link2 size={15} /></a>}
              {candidate.github_url && <a href={candidate.github_url} target="_blank" style={{ color: "var(--text-muted)" }}><GitBranch size={15} /></a>}
            </div>
          </div>
        </div>
        <button
          onClick={() => reportsApi.downloadCandidate(candidate.id)}
          className="btn btn-secondary"
          style={{ fontSize: 13 }}
          id="download-report-btn"
        >
          <Download size={14} /> Download Report
        </button>
      </div>

      {/* AI Summary */}
      {candidate.ai_summary && (
        <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", marginBottom: 6 }}>AI CANDIDATE SUMMARY</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{candidate.ai_summary}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Skills & Technologies */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Skills & Technologies</h2>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>SKILLS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {candidate.skills?.map((s: string) => <span key={s} className="badge badge-brand" style={{ fontSize: 11 }}>{s}</span>)}
              </div>
            </div>
            {candidate.technologies?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>TECHNOLOGIES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {candidate.technologies?.map((t: string) => <span key={t} className="badge badge-muted" style={{ fontSize: 11 }}>{t}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          {candidate.experience?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                <Briefcase size={18} color="#6366f1" /> Work Experience
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>({candidate.total_years_experience || 0} years total)</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {candidate.experience.map((exp: any, i: number) => (
                  <div key={i} style={{ paddingLeft: 16, borderLeft: "2px solid var(--border)" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{exp.title}</div>
                    <div style={{ fontSize: 13, color: "#6366f1", marginBottom: 4 }}>{exp.company}</div>
                    {exp.duration && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "flex", gap: 4, alignItems: "center" }}><Clock size={11} />{exp.duration}</div>}
                    {exp.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {candidate.projects?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                <Zap size={18} color="#f59e0b" /> Projects
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {candidate.projects.map((p: any, i: number) => (
                  <div key={i} style={{ padding: 16, background: "var(--bg-secondary)", borderRadius: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>{p.description}</p>
                    {p.technologies?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.technologies.map((t: string) => <span key={t} className="badge badge-muted" style={{ fontSize: 10 }}>{t}</span>)}
                      </div>
                    )}
                    {p.impact && <p style={{ fontSize: 12, color: "#10b981", marginTop: 6 }}>📈 {p.impact}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                <BookOpen size={18} color="#06b6d4" /> Education
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {candidate.education.map((e: any, i: number) => (
                  <div key={i} style={{ paddingLeft: 16, borderLeft: "2px solid var(--border)" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{e.degree} in {e.field}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{e.institution} · {e.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Quick Stats */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Profile Highlights</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Skills", value: candidate.skills?.length || 0, color: "#6366f1" },
                { label: "Technologies", value: candidate.technologies?.length || 0, color: "#06b6d4" },
                { label: "Projects", value: candidate.projects?.length || 0, color: "#f59e0b" },
                { label: "Certifications", value: candidate.certifications?.length || 0, color: "#10b981" },
                { label: "Achievements", value: candidate.achievements?.length || 0, color: "#8b5cf6" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Career Trajectory */}
          {candidate.career_progression && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: "flex", gap: 6, alignItems: "center" }}>
                <TrendingUp size={15} color="#10b981" /> Career Trajectory
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{candidate.career_progression}</p>
            </div>
          )}

          {/* Leadership */}
          {candidate.leadership_experience && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: "flex", gap: 6, alignItems: "center" }}>
                <Award size={15} color="#f59e0b" /> Leadership
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{candidate.leadership_experience}</p>
            </div>
          )}

          {/* Achievements */}
          {candidate.achievements?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
                <Star size={15} color="#f59e0b" /> Achievements
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {candidate.achievements.map((a: string, i: number) => (
                  <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "var(--text-secondary)" }}>
                    <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fraud Detection */}
          <div className="card" style={{ padding: 24, border: `1px solid ${riskColor}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, display: "flex", gap: 6, alignItems: "center" }}>
                <Shield size={15} color={riskColor} /> Integrity Check
              </h3>
              <span className="badge" style={{ background: `${riskColor}18`, color: riskColor, fontSize: 10 }}>
                {riskLevel} Risk
              </span>
            </div>
            <div className="score-bar-track" style={{ marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${(candidate.fraud_risk_score || 0) * 100}%`, background: riskColor, borderRadius: 999, transition: "width 1s ease" }} />
            </div>
            {candidate.fraud_flags?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {candidate.fraud_flags.map((flag: any, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 6 }}>
                    <AlertTriangle size={11} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    {flag.description || JSON.stringify(flag)}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "#10b981" }}>✓ No integrity concerns detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
