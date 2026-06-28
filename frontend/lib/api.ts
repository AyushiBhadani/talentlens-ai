import { API_BASE } from "./config";

// Jobs
export const jobsApi = {
  list: () => fetch(`${API_BASE}/api/v1/jobs/`).then(r => r.json()),
  get: (id: string) => fetch(`${API_BASE}/api/v1/jobs/${id}`).then(r => r.json()),
  create: (data: { description_raw: string; title?: string }) =>
    fetch(`${API_BASE}/api/v1/jobs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => { if (!r.ok) return r.json().then(e => { throw new Error(e.detail || "Failed"); }); return r.json(); }),
  update: (id: string, data: any) =>
    fetch(`${API_BASE}/api/v1/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  delete: (id: string) =>
    fetch(`${API_BASE}/api/v1/jobs/${id}`, { method: "DELETE" }),
  stats: () => fetch(`${API_BASE}/api/v1/jobs/stats`).then(r => r.json()),
};

// Candidates
export const candidatesApi = {
  list: () => fetch(`${API_BASE}/api/v1/candidates/`).then(r => r.json()),
  get: (id: string, anonymous = false) =>
    fetch(`${API_BASE}/api/v1/candidates/${id}?anonymous=${anonymous}`).then(r => r.json()),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE}/api/v1/candidates/upload`, {
      method: "POST",
      body: form,
    }).then(r => { if (!r.ok) return r.json().then(e => { throw new Error(e.detail || "Upload failed"); }); return r.json(); });
  },
  delete: (id: string) => fetch(`${API_BASE}/api/v1/candidates/${id}`, { method: "DELETE" }),
  stats: () => fetch(`${API_BASE}/api/v1/candidates/stats`).then(r => r.json()),
};

// Matching
export const matchingApi = {
  rankForJob: (jobId: string, anonymous = false) =>
    fetch(`${API_BASE}/api/v1/matching/jobs/${jobId}/rank?anonymous=${anonymous}`, { method: "POST" }).then(r => {
      if (!r.ok) return r.json().then(e => { throw new Error(e.detail || "Matching failed"); });
      return r.json();
    }),
  compare: (candidateAId: string, candidateBId: string, jobId?: string) =>
    fetch(`${API_BASE}/api/v1/matching/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_a_id: candidateAId, candidate_b_id: candidateBId, job_id: jobId }),
    }).then(r => r.json()),
};

// Analytics
export const analyticsApi = {
  overview: () => fetch(`${API_BASE}/api/v1/analytics/overview`).then(r => r.json()),
  skills: () => fetch(`${API_BASE}/api/v1/analytics/skills`).then(r => r.json()),
  experience: () => fetch(`${API_BASE}/api/v1/analytics/experience`).then(r => r.json()),
  pipeline: () => fetch(`${API_BASE}/api/v1/analytics/pipeline`).then(r => r.json()),
  recentActivity: () => fetch(`${API_BASE}/api/v1/analytics/recent-activity`).then(r => r.json()),
};

// LENS Assistant
export const assistantApi = {
  chat: (message: string, history: Array<{ role: string; content: string }>) =>
    fetch(`${API_BASE}/api/v1/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    }).then(r => { if (!r.ok) return r.json().then(e => { throw new Error(e.detail || "Chat failed"); }); return r.json(); }),
  suggestions: () => fetch(`${API_BASE}/api/v1/assistant/suggestions`).then(r => r.json()),
};

// Reports
export const reportsApi = {
  downloadCandidate: (candidateId: string, jobId?: string) => {
    const url = `${API_BASE}/api/v1/reports/candidate/${candidateId}/pdf${jobId ? `?job_id=${jobId}` : ""}`;
    window.open(url, "_blank");
  },
};
