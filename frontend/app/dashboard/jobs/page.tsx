"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { jobsApi } from "@/lib/api";
import {
  Plus, Briefcase, MapPin, Clock, Users, ChevronRight,
  Search, Filter, Trash2, Eye, TrendingUp, Building, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981", paused: "#f59e0b", closed: "#f43f5e", draft: "#94a3b8"
};

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: jobs, isLoading } = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });

  const deleteMutation = useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted");
    },
    onError: () => toast.error("Failed to delete job"),
  });

  const filtered = (jobs || []).filter((j: any) => {
    const matchSearch = !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.domain?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Job Descriptions</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {jobs?.length || 0} total · AI analyzes requirements automatically
          </p>
        </div>
        <Link href="/dashboard/jobs/new">
          <button className="btn btn-primary" id="new-job-btn">
            <Plus size={16} /> New Job
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="jobs-search"
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "active", "paused", "closed", "draft"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: "7px 14px", ...(statusFilter === s ? { background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.4)", color: "#6366f1" } : {}) }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="skeleton" style={{ height: 20, width: "70%", borderRadius: 6, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: "50%", borderRadius: 6, marginBottom: 20 }} />
              <div style={{ display: "flex", gap: 6 }}>
                {[...Array(3)].map((_, j) => <div key={j} className="skeleton" style={{ height: 22, width: 70, borderRadius: 999 }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <Briefcase size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No jobs found</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
            {search ? "Try a different search term" : "Create your first job description to get started"}
          </p>
          <Link href="/dashboard/jobs/new">
            <button className="btn btn-primary"><Plus size={15} /> Create Job</button>
          </Link>
        </div>
      ) : (
        <motion.div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {filtered.map((job: any) => (
            <motion.div key={job.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <div className="card card-interactive" style={{ padding: 24 }}>
                {/* Status + Domain */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {job.domain && <span className="badge badge-brand" style={{ fontSize: 10 }}>{job.domain}</span>}
                    {job.seniority && <span className="badge badge-muted" style={{ fontSize: 10 }}>{job.seniority}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[job.status] || "#94a3b8" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>{job.status}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{job.title}</h3>

                {/* Company + Location */}
                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  {job.company && <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 4, alignItems: "center" }}><Building size={11} />{job.company}</span>}
                  {job.location && <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 4, alignItems: "center" }}><MapPin size={11} />{job.location}</span>}
                  {job.employment_type && <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 4, alignItems: "center" }}><Clock size={11} />{job.employment_type}</span>}
                </div>

                {/* AI Summary */}
                {job.ai_summary && (
                  <p className="truncate-2" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                    {job.ai_summary}
                  </p>
                )}

                {/* Required Skills */}
                {job.required_skills?.length > 0 && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
                    {job.required_skills.slice(0, 4).map((s: string) => (
                      <span key={s} className="badge badge-muted" style={{ fontSize: 10 }}>{s}</span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="badge badge-muted" style={{ fontSize: 10 }}>+{job.required_skills.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <Link href={`/dashboard/jobs/${job.id}`} style={{ flex: 1 }}>
                    <button className="btn btn-secondary" style={{ fontSize: 12, width: "100%", justifyContent: "center" }}>
                      <Eye size={13} /> View
                    </button>
                  </Link>
                  <Link href={`/dashboard/matching?job=${job.id}`} style={{ flex: 1 }}>
                    <button className="btn btn-primary" style={{ fontSize: 12, width: "100%", justifyContent: "center" }}>
                      <TrendingUp size={13} /> Match
                    </button>
                  </Link>
                  <button
                    onClick={() => { if (confirm("Delete this job?")) deleteMutation.mutate(job.id); }}
                    className="btn btn-ghost"
                    style={{ padding: "8px", color: "#f43f5e" }}
                    title="Delete job"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
