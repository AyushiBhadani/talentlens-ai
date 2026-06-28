"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase, Users, Target, TrendingUp, Zap, BarChart3, ArrowRight,
  FileText, MessageSquare, Clock, CheckCircle, AlertCircle, Plus,
  Sparkles, Brain, Activity
} from "lucide-react";
import { analyticsApi, jobsApi, candidatesApi } from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

function StatCard({ icon: Icon, label, value, delta, color, i }: any) {
  return (
    <motion.div custom={i} variants={fadeUp} initial="hidden" animate="visible">
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={20} color={color} />
          </div>
          {delta && (
            <span className="badge badge-success" style={{ fontSize: 11 }}>
              <TrendingUp size={10} /> {delta}
            </span>
          )}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: "60%", height: 32, borderRadius: 8, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "40%", height: 14, borderRadius: 6 }} />
    </div>
  );
}

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

// Mock trend data for the chart
const trendData = [
  { month: "Jan", candidates: 12, matches: 8 },
  { month: "Feb", candidates: 19, matches: 14 },
  { month: "Mar", candidates: 28, matches: 22 },
  { month: "Apr", candidates: 35, matches: 30 },
  { month: "May", candidates: 42, matches: 38 },
  { month: "Jun", candidates: 51, matches: 47 },
];

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({ queryKey: ["overview"], queryFn: analyticsApi.overview });
  const { data: skills, isLoading: skillsLoading } = useQuery({ queryKey: ["skills"], queryFn: analyticsApi.skills });
  const { data: pipeline, isLoading: pipelineLoading } = useQuery({ queryKey: ["pipeline"], queryFn: analyticsApi.pipeline });
  const { data: activity, isLoading: activityLoading } = useQuery({ queryKey: ["activity"], queryFn: analyticsApi.recentActivity });
  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });
  const { data: candidates } = useQuery({ queryKey: ["candidates"], queryFn: candidatesApi.list });

  const stats = [
    { icon: Briefcase, label: "Active Jobs", value: overview?.active_jobs ?? "—", color: "#6366f1" },
    { icon: Users, label: "Total Candidates", value: overview?.total_candidates ?? "—", color: "#06b6d4" },
    { icon: Target, label: "AI Matches Run", value: overview?.total_matches ?? "—", color: "#10b981" },
    { icon: BarChart3, label: "Avg Match Score", value: overview ? `${overview.avg_match_score}%` : "—", color: "#8b5cf6" },
  ];

  const pipelineData = pipeline ? [
    { name: "Top Candidates", value: pipeline.pipeline.top_candidates, color: "#6366f1" },
    { name: "Strong Match", value: pipeline.pipeline.strong_matches, color: "#06b6d4" },
    { name: "Consider", value: pipeline.pipeline.consider, color: "#f59e0b" },
    { name: "Low Match", value: pipeline.pipeline.low_match, color: "#f43f5e" },
  ] : [];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Hiring Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Your AI-powered hiring command center</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard/jobs/new">
            <button className="btn btn-primary" style={{ fontSize: 13 }}>
              <Plus size={15} /> New Job
            </button>
          </Link>
          <Link href="/dashboard/assistant">
            <button className="btn btn-secondary" style={{ fontSize: 13 }}>
              <Sparkles size={15} /> Ask LENS
            </button>
          </Link>
        </div>
      </div>

      {/* LENS AI Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 24, padding: "16px 20px", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, display: "flex", gap: 14, alignItems: "center" }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Brain size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#6366f1" }}>LENS Insight · </span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {overview?.high_quality_matches > 0
              ? `${overview.high_quality_matches} candidates scored above 70% match. Ready for review.`
              : overview?.total_candidates === 0
              ? "Upload your first resume to start AI-powered candidate analysis and matching."
              : "Run semantic matching on your active jobs to get AI-powered candidate rankings."}
          </span>
        </div>
        <Link href="/dashboard/matching">
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>
            View <ArrowRight size={12} />
          </button>
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {overviewLoading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          stats.map((s, i) => <StatCard key={i} {...s} i={i} />)
        )}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Candidate Trend Chart */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Candidate Pipeline Trend</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 6 months · Candidates & Matches</p>
              </div>
              <span className="badge badge-brand">Live</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradCandidates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
                <Area type="monotone" dataKey="candidates" stroke="#6366f1" strokeWidth={2} fill="url(#gradCandidates)" name="Candidates" />
                <Area type="monotone" dataKey="matches" stroke="#10b981" strokeWidth={2} fill="url(#gradMatches)" name="Matched" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pipeline Donut */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible">
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Match Quality Pipeline</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Candidates by match tier</p>
            {pipelineLoading ? (
              <div className="skeleton" style={{ width: "100%", height: 160, borderRadius: 12 }} />
            ) : pipelineData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pipelineData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <Target size={32} color="var(--text-muted)" />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No matches yet</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {pipelineData.map((item) => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid: Recent Jobs + Candidates + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* Recent Jobs */}
        <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Recent Jobs</h3>
              <Link href="/dashboard/jobs" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>View all</Link>
            </div>
            {!jobs?.length ? (
              <EmptyState icon={Briefcase} text="No jobs yet" action="/dashboard/jobs/new" actionText="Add Job" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {jobs.slice(0, 4).map((job: any) => (
                  <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "10px 12px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid transparent", transition: "all 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{job.title}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {job.domain && <span className="badge badge-brand" style={{ fontSize: 10 }}>{job.domain}</span>}
                        <span className={`badge ${job.status === "active" ? "badge-success" : "badge-muted"}`} style={{ fontSize: 10 }}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Candidates */}
        <motion.div variants={fadeUp} custom={7} initial="hidden" animate="visible">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Recent Candidates</h3>
              <Link href="/dashboard/candidates" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>View all</Link>
            </div>
            {!candidates?.length ? (
              <EmptyState icon={Users} text="No candidates yet" action="/dashboard/candidates" actionText="Upload Resume" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {candidates.slice(0, 4).map((c: any) => (
                  <Link key={c.id} href={`/dashboard/candidates/${c.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "10px 12px", background: "var(--bg-secondary)", borderRadius: 10, display: "flex", gap: 10, alignItems: "center", border: "1px solid transparent", transition: "all 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {(c.name || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name || c.anonymous_id}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.total_years_experience ? `${c.total_years_experience}y exp` : "Experience TBD"}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp} custom={8} initial="hidden" animate="visible">
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
            {activityLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 44, borderRadius: 10 }} />
                ))}
              </div>
            ) : !activity?.activities?.length ? (
              <EmptyState icon={Activity} text="No activity yet" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activity.activities.map((a: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: a.type === "candidate_added" ? "rgba(6,182,212,0.1)" : "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {a.type === "candidate_added" ? <Users size={13} color="#06b6d4" /> : <Briefcase size={13} color="#6366f1" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "Just now"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, action, actionText }: { icon: any; text: string; action?: string; actionText?: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center" }}>
      <Icon size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: action ? 12 : 0 }}>{text}</p>
      {action && actionText && (
        <Link href={action}>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }}>
            <Plus size={12} /> {actionText}
          </button>
        </Link>
      )}
    </div>
  );
}
