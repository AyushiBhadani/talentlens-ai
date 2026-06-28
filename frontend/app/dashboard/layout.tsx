"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Brain, LayoutDashboard, Users, Briefcase, BarChart3, FileText,
  MessageSquare, Settings, LogOut, Moon, Sun, ChevronRight,
  Bell, Search, Menu, X, Sparkles, TrendingUp, GitCompare, Plus
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", id: "nav-dashboard" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs", id: "nav-jobs" },
  { href: "/dashboard/candidates", icon: Users, label: "Candidates", id: "nav-candidates" },
  { href: "/dashboard/matching", icon: TrendingUp, label: "Matching", id: "nav-matching" },
  { href: "/dashboard/compare", icon: GitCompare, label: "Compare", id: "nav-compare" },
  { href: "/dashboard/assistant", icon: MessageSquare, label: "LENS AI", id: "nav-lens", highlight: true },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", id: "nav-analytics" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports", id: "nav-reports" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", id: "nav-settings" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 32, height: 32 }} />;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-tertiary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.2s" }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("tl_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { }
    } else {
      router.push("/login");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("tl_user");
    localStorage.removeItem("tl_token");
    toast.success("Signed out successfully");
    router.push("/login");
  }

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-secondary)" }}>
      {/* ============================================================
          SIDEBAR
          ============================================================ */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          overflow: "hidden",
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)", minHeight: 64 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>
            <Brain size={18} color="white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}
              >
                TalentLens <span className="gradient-text">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4, borderRadius: 6, flexShrink: 0 }}
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Quick Action */}
        {sidebarOpen && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <Link href="/dashboard/jobs/new" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", borderRadius: 10, color: "white", textDecoration: "none", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
              <Plus size={15} /> New Job
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                id={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                style={{
                  marginBottom: 2,
                  display: "flex",
                  background: item.highlight && !isActive ? "rgba(99,102,241,0.06)" : undefined,
                  overflow: "hidden",
                }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {item.label}
                      {item.highlight && <span className="badge badge-brand" style={{ marginLeft: 8, fontSize: 10 }}>AI</span>}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", justifyContent: "flex-start", overflow: "hidden" }}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ whiteSpace: "nowrap" }}>
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <AnimatePresence>
            {sidebarOpen && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: "10px 12px", marginTop: 4, display: "flex", gap: 10, alignItems: "center" }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || "Recruiter"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ============================================================
          MAIN CONTENT AREA
          ============================================================ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top Bar */}
        <header style={{ height: 60, background: "var(--bg-card)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />
            <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>
              {((user?.name || user?.email || "R")[0]).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
