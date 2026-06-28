"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { candidatesApi } from "@/lib/api";
import {
  Upload, Users, Search, Trash2, Eye, FileText, AlertTriangle,
  Plus, ChevronRight, Brain, TrendingUp, Clock, Award, Code,
  CheckCircle, XCircle
} from "lucide-react";
import { toast } from "sonner";

function FraudBadge({ score }: { score: number }) {
  if (score < 0.2) return <span className="badge badge-success" style={{ fontSize: 10 }}>✓ Verified</span>;
  if (score < 0.5) return <span className="badge badge-warning" style={{ fontSize: 10 }}>⚠ Low Risk</span>;
  return <span className="badge badge-danger" style={{ fontSize: 10 }}>⚡ Review</span>;
}

function UploadZone({ onUpload }: { onUpload: (files: File[]) => void }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    onDrop: (accepted) => { if (accepted.length > 0) onUpload(accepted); },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div {...getRootProps()} className={`drop-zone ${isDragActive ? "active" : ""}`} id="resume-upload-zone">
      <input {...getInputProps()} id="resume-file-input" />
      <Upload size={32} color="#6366f1" style={{ marginBottom: 12 }} />
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
        {isDragActive ? "Drop to upload" : "Upload Resumes"}
      </h3>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
        Drag & drop or click to select <strong>multiple</strong> PDF or DOCX files at once (max 10MB each)
      </p>
      <button type="button" className="btn btn-primary" style={{ fontSize: 13, pointerEvents: "none" }}>
        <Plus size={14} /> Choose Files
      </button>
    </div>
  );
}

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [uploadQueue, setUploadQueue] = useState<{ name: string; status: "pending" | "uploading" | "done" | "error" }[]>([]);

  const { data: candidates, isLoading } = useQuery({ queryKey: ["candidates"], queryFn: candidatesApi.list });

  const uploadMutation = useMutation({
    mutationFn: candidatesApi.upload,
  });

  const deleteMutation = useMutation({
    mutationFn: candidatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate removed");
    },
  });

  async function handleUpload(files: File[]) {
    // Build initial queue
    const queue = files.map(f => ({ name: f.name, status: "pending" as const }));
    setUploadQueue(queue);

    for (let i = 0; i < files.length; i++) {
      setUploadQueue(q => q.map((item, idx) => idx === i ? { ...item, status: "uploading" } : item));
      try {
        const data = await uploadMutation.mutateAsync(files[i]);
        queryClient.invalidateQueries({ queryKey: ["candidates"] });
        setUploadQueue(q => q.map((item, idx) => idx === i ? { ...item, status: "done" } : item));
        toast.success(`${data.name || files[i].name} analyzed!`);
      } catch (err: any) {
        setUploadQueue(q => q.map((item, idx) => idx === i ? { ...item, status: "error" } : item));
        toast.error(`Failed: ${files[i].name}`);
      }
    }

    // Clear queue after 3 seconds
    setTimeout(() => setUploadQueue([]), 3000);
  }

  const filtered = (candidates || []).filter((c: any) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
    c.ai_summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Candidates</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {candidates?.length || 0} candidates · AI-analyzed resumes ready for matching
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div style={{ marginBottom: 24 }}>
        <UploadZone onUpload={handleUpload} />
        <AnimatePresence>
          {uploadQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 12, padding: "14px 16px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12 }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Uploading {uploadQueue.filter(q => q.status === "done").length} / {uploadQueue.length} resumes
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {uploadQueue.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.status === "uploading" && (
                      <div style={{ width: 14, height: 14, border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite", flexShrink: 0 }} />
                    )}
                    {item.status === "done" && <CheckCircle size={14} color="#22c55e" style={{ flexShrink: 0 }} />}
                    {item.status === "error" && <XCircle size={14} color="#f43f5e" style={{ flexShrink: 0 }} />}
                    {item.status === "pending" && <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--border)", flexShrink: 0 }} />}
                    <span style={{ fontSize: 12, color: item.status === "done" ? "#22c55e" : item.status === "error" ? "#f43f5e" : "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                      {item.status === "uploading" ? "Analyzing..." : item.status === "done" ? "Done" : item.status === "error" ? "Failed" : "Waiting"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          className="input"
          style={{ paddingLeft: 38 }}
          placeholder="Search by name, skill, or summary..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="candidates-search"
        />
      </div>

      {/* Candidates Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => <CandidateCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No candidates yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Upload your first resume to begin AI-powered analysis</p>
        </div>
      ) : (
        <motion.div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {filtered.map((c: any) => (
            <motion.div key={c.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <div className="card card-interactive" style={{ padding: 24 }}>
                {/* Avatar + Name */}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, color: "var(--text-primary)" }}>{c.name || c.anonymous_id}</h3>
                      <FraudBadge score={c.fraud_risk_score || 0} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {c.total_years_experience && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 4, alignItems: "center" }}>
                          <Award size={11} /> {c.total_years_experience}y exp
                        </span>
                      )}
                      {c.location && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {c.ai_summary && (
                  <p className="truncate-3" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
                    {c.ai_summary}
                  </p>
                )}

                {/* Top Skills */}
                {c.skills?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
                    {c.skills.slice(0, 5).map((s: string) => (
                      <span key={s} className="badge badge-muted" style={{ fontSize: 10 }}>{s}</span>
                    ))}
                    {c.skills.length > 5 && (
                      <span className="badge badge-muted" style={{ fontSize: 10 }}>+{c.skills.length - 5}</span>
                    )}
                  </div>
                )}

                {/* Career Progression */}
                {c.career_progression && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, display: "flex", gap: 5, alignItems: "flex-start" }}>
                    <TrendingUp size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span className="truncate-2">{c.career_progression}</span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/dashboard/candidates/${c.id}`} style={{ flex: 1 }}>
                    <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>
                      <Eye size={13} /> View
                    </button>
                  </Link>
                  <button
                    onClick={() => { if (confirm("Remove this candidate?")) deleteMutation.mutate(c.id); }}
                    className="btn btn-ghost"
                    style={{ padding: "8px", color: "#f43f5e" }}
                    title="Remove candidate"
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

function CandidateCardSkeleton() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 16, width: "60%", borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, width: "40%", borderRadius: 6 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 48, borderRadius: 8, marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 6 }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 22, width: 60, borderRadius: 999 }} />)}
      </div>
    </div>
  );
}
