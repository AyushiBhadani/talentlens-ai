"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { candidatesApi, jobsApi, reportsApi, matchingApi } from "@/lib/api";
import { Download, FileText, Users, Briefcase, GitCompare, ArrowRight, Brain } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { data: candidates } = useQuery({ queryKey: ["candidates"], queryFn: candidatesApi.list });
  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [generating, setGenerating] = useState(false);

  function handleDownload() {
    if (!selectedCandidate) { toast.error("Please select a candidate"); return; }
    setGenerating(true);
    setTimeout(() => {
      reportsApi.downloadCandidate(selectedCandidate, selectedJob || undefined);
      setGenerating(false);
      toast.success("Report generated! Check your downloads.");
    }, 500);
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Reports</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Generate AI-powered PDF reports for candidates and job matches</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Candidate Report */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={20} color="#6366f1" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Candidate Report</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Full AI analysis with skills, experience, and match scores</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Select Candidate *</label>
              <select className="input" value={selectedCandidate} onChange={e => setSelectedCandidate(e.target.value)} id="report-candidate-select">
                <option value="">Choose a candidate...</option>
                {candidates?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name || c.anonymous_id}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Include Job Match (optional)</label>
              <select className="input" value={selectedJob} onChange={e => setSelectedJob(e.target.value)} id="report-job-select">
                <option value="">No job match</option>
                {jobs?.map((j: any) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div style={{ padding: "12px 14px", background: "var(--bg-secondary)", borderRadius: 10, fontSize: 12, color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>Report includes:</strong> Profile summary, skills, experience, education,
              {selectedJob ? " match scores, AI explanations, skill gaps, interview questions," : ""} and integrity check.
            </div>

            <button
              onClick={handleDownload}
              disabled={!selectedCandidate || generating}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: 14 }}
              id="generate-report-btn"
            >
              {generating ? (
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" }} />
              ) : (
                <><Download size={15} /> Generate PDF Report</>
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              icon: Brain,
              title: "AI Match Analysis",
              desc: "Run semantic matching and get ranked candidates for any job",
              action: "/dashboard/matching",
              label: "Go to Matching",
              color: "#6366f1",
            },
            {
              icon: GitCompare,
              title: "Candidate Comparison",
              desc: "Compare two candidates side-by-side with AI insights",
              action: "/dashboard/compare",
              label: "Compare Now",
              color: "#06b6d4",
            },
            {
              icon: Users,
              title: "Candidate Profiles",
              desc: "View individual candidate reports and download individual PDFs",
              action: "/dashboard/candidates",
              label: "View Candidates",
              color: "#10b981",
            },
          ].map(({ icon: Icon, title, desc, action, label, color }) => (
            <div key={title} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>{title}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</p>
                </div>
              </div>
              <a href={action}>
                <button className="btn btn-secondary" style={{ fontSize: 12, width: "100%", justifyContent: "center" }}>
                  {label} <ArrowRight size={12} />
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
