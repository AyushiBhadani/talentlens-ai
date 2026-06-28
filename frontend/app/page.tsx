"use client";

import { motion, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  Brain, Zap, Shield, BarChart3, Users, Target, ArrowRight, Check,
  ChevronRight, Star, Sparkles, Eye, FileText, TrendingUp, Award,
  Lock, Globe, Clock, Search, MessageSquare, Download, Moon, Sun
} from "lucide-react";
import { useTheme } from "next-themes";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="btn btn-ghost"
      style={{ padding: "8px", borderRadius: "8px" }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const features = [
  { icon: Brain, title: "Semantic Intelligence", description: "Understands meaning, not just keywords. AWS ≡ Cloud. TensorFlow ≡ ML.", color: "#6366f1", badge: "Core AI" },
  { icon: Eye, title: "Explainable Rankings", description: "Every score has evidence. See exactly why each candidate is ranked.", color: "#06b6d4", badge: "Transparency" },
  { icon: Shield, title: "Bias Reduction", description: "Anonymous mode hides names, photos, and demographics. Rank on merit.", color: "#10b981", badge: "Ethics" },
  { icon: Zap, title: "Hidden Talent Detection", description: "Spots equivalent experience even without exact job title matches.", color: "#f59e0b", badge: "Intelligence" },
  { icon: MessageSquare, title: "LENS AI Copilot", description: "Ask anything: 'Compare A and B', 'Generate interview questions', 'Write rejection email'.", color: "#8b5cf6", badge: "Assistant" },
  { icon: BarChart3, title: "Deep Analytics", description: "Hiring funnel, skill distribution, efficiency metrics, and trend insights.", color: "#f43f5e", badge: "Insights" },
];

const problems = [
  "Keyword-based ATS rejects 75% of qualified candidates",
  "Unconscious bias affects hiring decisions systematically",
  "Recruiters spend 23 hours screening per hire on average",
  "Hidden talent with non-traditional backgrounds is invisible",
  "No explanation = no trust in AI-driven decisions",
];

const solutions = [
  "Semantic matching finds qualified candidates ATS would miss",
  "Anonymous mode evaluates on skills only, not demographics",
  "AI pre-screening reduces recruiter time by up to 80%",
  "Transferable skill detection surfaces non-traditional candidates",
  "Every recommendation comes with evidence and reasoning",
];

const testimonials = [
  { name: "Sarah Chen", title: "Head of Engineering Recruiting", company: "Fintech Scale-up", quote: "TalentLens found a brilliant ML engineer who had only 'recommendation systems' and 'NLP projects' on their resume — not 'Machine Learning Engineer'. It would have been rejected by our old ATS.", avatar: "SC" },
  { name: "Marcus Williams", title: "VP of People", company: "Series B SaaS", quote: "The bias reduction feature changed how we think about hiring. We promoted more diverse candidates by 40% in one quarter by removing demographic identifiers from initial screening.", avatar: "MW" },
  { name: "Priya Patel", title: "Technical Recruiter", company: "Enterprise Software", quote: "LENS generates interview questions that actually reference the candidate's background. No more generic questions — every interview is personalized and insightful.", avatar: "PP" },
];

const workflow = [
  { step: "01", title: "Upload Job Description", description: "Paste or upload your JD. LENS deeply understands requirements, priorities, and implicit expectations.", icon: FileText },
  { step: "02", title: "Upload Resumes", description: "Drag and drop PDF or DOCX files. AI extracts skills, projects, achievements, and hidden signals.", icon: Users },
  { step: "03", title: "Semantic Matching", description: "Multi-dimensional AI ranking. Technical, experience, leadership, culture fit — all explained.", icon: Target },
  { step: "04", title: "Hire with Confidence", description: "Interview questions, comparison reports, skill gap analysis. Everything you need to make the right call.", icon: Award },
];

const pricingPlans = [
  { name: "Starter", price: "Free", period: "forever", features: ["5 active jobs", "25 candidate uploads/month", "Basic semantic matching", "AI summaries", "Email support"], cta: "Get Started", highlight: false },
  { name: "Growth", price: "$79", period: "/month", features: ["Unlimited jobs", "Unlimited candidates", "Advanced semantic matching", "LENS AI Copilot", "Bias reduction mode", "PDF reports", "Interview generator", "Priority support"], cta: "Start Free Trial", highlight: true, badge: "Most Popular" },
  { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Growth", "Custom integrations", "SSO & SAML", "Dedicated success manager", "SLA guarantee", "On-premise option", "Custom AI training"], cta: "Contact Sales", highlight: false },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ============================================================
          NAVBAR
          ============================================================ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: 24 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)"
            }}>
              <Brain size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
              TalentLens <span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {["Features", "How it Works", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                style={{ padding: "8px 14px", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none", borderRadius: 8, transition: "all 0.2s" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--text-primary)"; (e.target as HTMLElement).style.background = "var(--bg-tertiary)"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; (e.target as HTMLElement).style.background = "transparent"; }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />
            <Link href="/login">
              <button className="btn btn-ghost" style={{ fontSize: 14 }}>Sign In</button>
            </Link>
            <Link href="/register">
              <button className="btn btn-primary" style={{ fontSize: 14 }}>
                Get Started Free <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section ref={heroRef} className="hero-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 100, paddingBottom: 80 }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity, width: "100%" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 999, marginBottom: 32, fontSize: 13, fontWeight: 600, color: "#6366f1" }}
            >
              <Sparkles size={14} />
              Powered by Gemini AI + Semantic Embeddings
            </motion.div>

            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24 }}
            >
              Beyond Keywords.
              <br />
              <span className="gradient-text">Beyond Resumes.</span>
            </motion.h1>

            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.7 }}
            >
              The AI Hiring Copilot that understands what candidates <em>actually know</em>,
              explains every ranking decision, and helps your team hire 10x smarter.
            </motion.p>

            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/register">
                <button className="btn btn-primary animate-pulse-glow" style={{ fontSize: 16, padding: "14px 32px", borderRadius: 12 }}>
                  <Sparkles size={18} />
                  Start Hiring Smarter — Free
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="btn btn-secondary" style={{ fontSize: 16, padding: "14px 28px", borderRadius: 12 }}>
                  View Demo Dashboard <ArrowRight size={16} />
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 72, flexWrap: "wrap" }}
            >
              {[
                { value: 94, suffix: "%", label: "Match Accuracy" },
                { value: 80, suffix: "%", label: "Time Saved" },
                { value: 3, suffix: "x", label: "Better Hires" },
                { value: 40, suffix: "%", label: "More Diverse Teams" },
              ].map(({ value, suffix, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: "#6366f1", letterSpacing: "-0.02em" }}>
                    <AnimatedCounter end={value} suffix={suffix} />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          PROBLEM vs SOLUTION
          ============================================================ */}
      <section style={{ padding: "100px 24px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Traditional ATS is <span className="gradient-text-warm">Broken</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>Here's how TalentLens AI fixes it.</p>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Problems */}
              <div className="card" style={{ padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f43f5e" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f43f5e", letterSpacing: "0.08em" }}>THE PROBLEM</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {problems.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 12, color: "#f43f5e", fontWeight: 700 }}>✕</span>
                      </div>
                      <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solutions */}
              <div className="card" style={{ padding: 32, border: "1px solid rgba(99,102,241,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981", letterSpacing: "0.08em" }}>TALENTLENS AI</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {solutions.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <Check size={12} color="#10b981" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FEATURES
          ============================================================ */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Every Feature <span className="gradient-text">Drives Value</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 500, margin: "0 auto" }}>
                No gimmicks. Every AI feature directly reduces recruiter effort or improves hiring quality.
              </p>
            </motion.div>

            <motion.div variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
              {features.map((f, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <div className="card card-interactive" style={{ padding: 28, height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <f.icon size={22} color={f.color} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{f.title}</h3>
                          <span className="badge" style={{ background: `${f.color}18`, color: f.color, fontSize: 10 }}>{f.badge}</span>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section id="how-it-works" style={{ padding: "100px 24px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                From JD to <span className="gradient-text">Hire Decision</span> in Minutes
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
              {workflow.map((step, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <div className="card" style={{ padding: 28, textAlign: "center", position: "relative" }}>
                    {i < workflow.length - 1 && (
                      <div style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", zIndex: 1, display: "none" }}>
                        <ChevronRight size={20} color="var(--text-muted)" />
                      </div>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", marginBottom: 16 }}>STEP {step.step}</div>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                      <step.icon size={24} color="#6366f1" />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
          ============================================================ */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Recruiters <span className="gradient-text">Love It</span>
              </h2>
            </motion.div>

            <motion.div variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {testimonials.map((t, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                      "{t.quote}"
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
                        {t.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.title} · {t.company}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          PRICING
          ============================================================ */}
      <section id="pricing" style={{ padding: "100px 24px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Simple, Transparent <span className="gradient-text">Pricing</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>No hidden fees. Cancel anytime.</p>
            </motion.div>

            <motion.div variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
              {pricingPlans.map((plan, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <div className="card" style={{
                    padding: 32,
                    border: plan.highlight ? "2px solid #6366f1" : undefined,
                    background: plan.highlight ? "rgba(99,102,241,0.04)" : undefined,
                    position: "relative",
                  }}>
                    {plan.badge && (
                      <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
                        {plan.badge}
                      </div>
                    )}
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.name}</h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: plan.highlight ? "#6366f1" : "var(--text-primary)" }}>{plan.price}</span>
                      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{plan.period}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <Check size={14} color={plan.highlight ? "#6366f1" : "#10b981"} strokeWidth={3} />
                          <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register" style={{ display: "block" }}>
                      <button className={`btn ${plan.highlight ? "btn-primary" : "btn-secondary"}`} style={{ width: "100%", justifyContent: "center" }}>
                        {plan.cta}
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          CTA
          ============================================================ */}
      <section style={{ padding: "100px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}
        >
          <div style={{ padding: "64px 48px", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24 }}>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Ready to Hire <span className="gradient-text">Smarter?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, marginBottom: 36, lineHeight: 1.6 }}>
              Join forward-thinking recruiting teams who use AI to find the best candidates — not just the best keyword-matchers.
            </p>
            <Link href="/register">
              <button className="btn btn-primary animate-pulse-glow" style={{ fontSize: 16, padding: "16px 40px", borderRadius: 12 }}>
                <Sparkles size={18} />
                Start for Free Today
              </button>
            </Link>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>No credit card required · Setup in 5 minutes</p>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer style={{ padding: "40px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={14} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>TalentLens AI</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Security", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>© 2026 TalentLens AI. Built for the Data & AI Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
