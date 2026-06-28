"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { jobsApi } from "@/lib/api";
import {
  ArrowLeft, Briefcase, MapPin, Building, Clock, Globe, ChevronRight,
  Star, Target, Users, TrendingUp, CheckCircle, AlertCircle, Brain,
  Trash2, Edit, Zap, GraduationCap, Heart, Award
} from "lucide-react";
import { toast } from "sonner";

function SkillPill({ skill, color = "brand" }: { skill: string; color?: string }) {
  return <span className={`badge badge-${color}`} style={{ margin: "2px" }}>{skill}</span>;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({ queryKey: ["job", id], queryFn: () => jobsApi.get(id) });

  const deleteMutation = useMutation({
    mutationFn: () => jobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      router.push("/dashboard/jobs");
      toast.success("Job deleted");
    },
  });

  if (isLoading) return <JobDetailSkeleton />;
  if (!job || job.detail) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <AlertCircle size={40} color="#f43f5e" style={{ margin: "0 auto 16px" }} />
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Job Not Found</h2>
      <Link href="/dashboard/jobs"><button className="btn btn-secondary">Back to Jobs</button></Link>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/jobs" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Jobs
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {job.domain && <span className="badge badge-brand">{job.domain}</span>}
              {job.seniority && <span className="badge badge-muted">{job.seniority}</span>}
              {job.employment_type && <span className="badge badge-cyan">{job.employment_type}</span>}
              <span className={`badge ${job.status === "active" ? "badge-success" : "badge-warning"}`} style={{ textTransform: "capitalize" }}>
                {job.status}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>{job.title}</h1>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {job.company && <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 5, alignItems: "center" }}><Building size={13} />{job.company}</span>}
              {job.location && <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 5, alignItems: "center" }}><MapPin size={13} />{job.location}</span>}
              {job.industry && <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 5, alignItems: "center" }}><Globe size={13} />{job.industry}</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/dashboard/matching?job=${job.id}`}>
              <button className="btn btn-primary" id="match-candidates-btn">
                <TrendingUp size={15} /> Match Candidates
              </button>
            </Link>
            <button
              onClick={() => { if (confirm("Delete this job?")) deleteMutation.mutate(); }}
              className="btn btn-secondary"
              style={{ color: "#f43f5e" }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary Banner */}
      {job.ai_summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, marginBottom: 24, display: "flex", gap: 14, alignItems: "flex-start" }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Brain size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 4 }}>AI SUMMARY</div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{job.ai_summary}</p>
          </div>
        </motion.div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Skills Grid */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Skill Requirements</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>REQUIRED SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {job.required_skills?.map((s: string) => <SkillPill key={s} skill={s} color="brand" />)}
                  {!job.required_skills?.length && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>None specified</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>PREFERRED SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {job.preferred_skills?.map((s: string) => <SkillPill key={s} skill={s} color="cyan" />)}
                  {!job.preferred_skills?.length && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>None specified</span>}
                </div>
              </div>
              {job.soft_skills?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>SOFT SKILLS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {job.soft_skills.map((s: string) => <SkillPill key={s} skill={s} color="violet" />)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Responsibilities</h2>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {job.responsibilities.map((r: string, i: number) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <ChevronRight size={12} color="#6366f1" />
                    </div>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw JD */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Original Job Description</h2>
            <pre style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit", overflow: "auto", maxHeight: 300 }}>
              {job.description_raw}
            </pre>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Key Info */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Position Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Experience", value: job.experience_requirements, icon: Award },
                { label: "Education", value: job.education_requirements, icon: GraduationCap },
                { label: "Leadership", value: job.leadership_expectations, icon: Users },
              ].map(({ label, value, icon: Icon }) => value && (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 4, display: "flex", gap: 5, alignItems: "center" }}>
                    <Icon size={11} /> {label.toUpperCase()}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Priorities */}
          {job.hiring_priorities?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>AI: Hiring Priorities</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {job.hiring_priorities.map((p: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: `${["rgba(99,102,241,0.15)", "rgba(6,182,212,0.12)", "rgba(16,185,129,0.12)", "rgba(245,158,11,0.12)"][i % 4]}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"][i % 4] }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action */}
          <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.2)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Ready to Find Talent?</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>Run AI matching to semantically rank all uploaded candidates for this role.</p>
            <Link href={`/dashboard/matching?job=${job.id}`} style={{ display: "block" }}>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
                <Target size={14} /> Run AI Matching
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 6, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: "60%", height: 32, borderRadius: 8, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: "40%", height: 14, borderRadius: 6, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </div>
    </div>
  );
}
