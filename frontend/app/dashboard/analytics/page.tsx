"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { analyticsApi } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { BarChart3, Users, Target, TrendingUp, Zap } from "lucide-react";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899", "#14b8a6"];

const trendData = [
  { month: "Jan", hired: 3, screened: 28, ratio: 10.7 },
  { month: "Feb", hired: 5, screened: 35, ratio: 14.3 },
  { month: "Mar", hired: 4, screened: 42, ratio: 9.5 },
  { month: "Apr", hired: 7, screened: 51, ratio: 13.7 },
  { month: "May", hired: 6, screened: 38, ratio: 15.8 },
  { month: "Jun", hired: 9, screened: 60, ratio: 15.0 },
];

export default function AnalyticsPage() {
  const { data: overview } = useQuery({ queryKey: ["overview"], queryFn: analyticsApi.overview });
  const { data: skills } = useQuery({ queryKey: ["skills"], queryFn: analyticsApi.skills });
  const { data: experience } = useQuery({ queryKey: ["experience"], queryFn: analyticsApi.experience });
  const { data: pipeline } = useQuery({ queryKey: ["pipeline"], queryFn: analyticsApi.pipeline });

  const pipelineChartData = pipeline ? [
    { name: "Top Candidates (>80%)", value: pipeline.pipeline.top_candidates, fill: "#6366f1" },
    { name: "Strong Match (60-80%)", value: pipeline.pipeline.strong_matches, fill: "#06b6d4" },
    { name: "Consider (40-60%)", value: pipeline.pipeline.consider, fill: "#f59e0b" },
    { name: "Low Match (<40%)", value: pipeline.pipeline.low_match, fill: "#f43f5e" },
  ] : [];

  const skillsData = skills?.skills?.slice(0, 12) || [];
  const expData = experience?.distribution || [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Hiring intelligence at a glance</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Jobs", value: overview?.total_jobs || 0, icon: Target, color: "#6366f1" },
          { label: "Total Candidates", value: overview?.total_candidates || 0, icon: Users, color: "#06b6d4" },
          { label: "AI Matches", value: overview?.total_matches || 0, icon: Zap, color: "#10b981" },
          { label: "Avg Match Score", value: `${overview?.avg_match_score || 0}%`, icon: TrendingUp, color: "#f59e0b" },
          { label: "High Quality", value: overview?.high_quality_matches || 0, icon: BarChart3, color: "#8b5cf6" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Top Skills Bar Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Top Candidate Skills</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Most common skills across all uploaded resumes</p>
          {skillsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={skillsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" width={90} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Candidates">
                  {skillsData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="Upload resumes to see skill distribution" />
          )}
        </div>

        {/* Experience Distribution */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Experience Distribution</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Years of experience across candidates</p>
          {expData.some((d: any) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Candidates">
                  {expData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="Upload resumes to see experience distribution" />
          )}
        </div>

        {/* Pipeline Breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Match Quality Pipeline</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Candidate distribution by match score tier</p>
          {pipelineChartData.some(d => d.value > 0) ? (
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pipelineChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pipelineChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {pipelineChartData.map(item => (
                  <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: item.fill, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart text="Run AI matching to see pipeline data" />
          )}
        </div>

        {/* Recruiting Efficiency */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Recruiting Trend</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Screened vs. hired over 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradScreened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="screened" stroke="#6366f1" strokeWidth={2} fill="url(#gradScreened)" name="Screened" />
              <Area type="monotone" dataKey="hired" stroke="#10b981" strokeWidth={2} fill="url(#gradHired)" name="Hired" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
      <BarChart3 size={32} color="var(--text-muted)" />
      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>{text}</p>
    </div>
  );
}
