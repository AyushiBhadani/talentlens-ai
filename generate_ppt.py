from fpdf import FPDF
import os

class PresentationPDF(FPDF):
    def __init__(self):
        # 16:9 landscape format (297 x 167 mm)
        super().__init__(orientation="L", unit="mm", format=(167, 297))
        self.set_auto_page_break(auto=True, margin=15)
        
    def draw_header(self):
        # Draw the black top bar
        self.set_fill_color(0, 0, 0)
        self.rect(0, 0, 297, 20, style="F")
        
        # Left text: redrob | H2S
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(255, 255, 255)
        self.set_xy(10, 6)
        self.cell(0, 8, "redrob  |  H2S", ln=False, align="L")
        
        # Right text: INDIA.RUNS
        self.set_font("Helvetica", "I", 14)
        self.set_xy(10, 6)
        self.cell(277, 8, "INDIA.RUNS", ln=False, align="R")
        
    def add_slide(self, title, content_lines, is_title_slide=False, is_end_slide=False):
        self.add_page()
        
        if is_end_slide:
            # Dark background for the end slide to mimic the gradient
            self.set_fill_color(30, 20, 60) # Dark purple
            self.rect(0, 0, 297, 167, style="F")
            self.draw_header()
            
            self.set_text_color(255, 255, 255)
            self.set_font("Helvetica", "B", 40)
            self.set_xy(0, 60)
            self.cell(297, 20, "INDIA.RUNS", ln=True, align="C")
            
            self.set_font("Helvetica", "", 16)
            self.cell(297, 10, "Build what next India runs on", ln=True, align="C")
            
            self.set_font("Helvetica", "B", 36)
            self.set_xy(0, 110)
            self.cell(297, 20, "THANK YOU", ln=True, align="C")
            return
            
        self.draw_header()
        
        if is_title_slide:
            self.set_xy(0, 60)
            self.set_font("Helvetica", "B", 36)
            self.set_text_color(30, 30, 30)
            self.cell(297, 15, title, ln=True, align="C")
            
            self.set_font("Helvetica", "", 18)
            self.set_text_color(80, 80, 80)
            for line in content_lines:
                self.cell(297, 10, line, ln=True, align="C")
        else:
            # Normal slide
            self.set_xy(15, 30)
            self.set_font("Helvetica", "B", 24)
            self.set_text_color(30, 30, 30)
            self.cell(0, 15, title, ln=True, align="L")
            
            self.set_xy(20, 55)
            self.set_font("Helvetica", "", 16)
            self.set_text_color(50, 50, 50)
            
            for line in content_lines:
                line = line.replace("—", "-").replace("'", "'").replace('"', '"').replace("•", "-")
                if line.startswith("**"):
                    # Bold header within content
                    self.set_font("Helvetica", "B", 16)
                    self.cell(0, 10, line.replace("**", ""), ln=True)
                    self.set_font("Helvetica", "", 16)
                elif line.startswith("-") or line.startswith("*"):
                    # Bullet point
                    self.set_x(25)
                    self.multi_cell(250, 8, "- " + line[1:].strip())
                    self.ln(4)
                else:
                    self.set_x(20)
                    self.multi_cell(250, 8, line)
                    self.ln(4)

slides = [
    {
        "title": "TalentLens AI",
        "content": [
            "Intelligent Resume Parsing & AI-Driven Candidate Matching",
            "",
            "Build what next India runs on",
            "Team: [Your Team Name]"
        ],
        "is_title": True
    },
    {
        "title": "The Hiring Bottleneck",
        "content": [
            "- HR teams spend up to 15 hours a week manually screening resumes.",
            "- Traditional Keyword Matching is flawed—it misses highly qualified candidates who use synonyms.",
            "- High volume of applications makes it impossible to give every candidate a fair evaluation.",
            "**Our Solution:**",
            "- An AI-powered matching engine that understands context, not just keywords."
        ],
        "is_title": False
    },
    {
        "title": "JD Understanding & Candidate Evaluation",
        "content": [
            "- Dynamic JD Parsing: We don't just extract text; we use AI to understand the intent of the JD.",
            "- Smart Candidate Profiling: Resumes are parsed using NLP to build structured profiles.",
            "- Beyond Keywords: If a JD asks for 'Machine Learning' and a resume says 'Trained Neural Networks',",
            "  our AI knows it's a match."
        ],
        "is_title": False
    },
    {
        "title": "Ranking Methodology",
        "content": [
            "Our algorithm scores candidates across 5 key dimensions:",
            "- Technical Score (40%): Exact and partial skill overlap.",
            "- Experience Score (25%): Textual similarity of past responsibilities + years of experience.",
            "- Leadership Score (15%): Matching leadership expectations with past roles.",
            "- Education Score (10%): Degree and field relevance.",
            "- Soft Skills Score (10%): Inferred from project descriptions and achievements."
        ],
        "is_title": False
    },
    {
        "title": "The LENS Assistant (Unique Feature)",
        "content": [
            "Conversational AI for Recruiters:",
            "- Interactive Chat: Recruiters can chat with our LENS Assistant (powered by Groq / Llama 3).",
            "- Context-Aware: The AI knows all the candidates in the database.",
            "- Use Cases:",
            "  • 'Who is the best candidate for the Python Intern role?'",
            "  • 'Draft a polite rejection email for Rahul.'",
            "  • 'What are 3 technical interview questions I should ask Karthik?'"
        ],
        "is_title": False
    },
    {
        "title": "System Architecture",
        "content": [
            "- Frontend: Next.js (React) dashboard with seamless Drag & Drop multi-file uploads.",
            "- Backend: FastAPI (Python) asynchronous server ensuring non-blocking, high-speed API responses.",
            "- AI Engine: Groq API running Llama-3.3-70b for lightning-fast semantic evaluation.",
            "- Data Flow: Resume Upload -> Text Extraction -> Structuring -> Scoring Engine -> Dashboard."
        ],
        "is_title": False
    },
    {
        "title": "Scalability & Workflow",
        "content": [
            "- Bulk Processing: Recruiters can upload 10, 50, or 100 resumes at once.",
            "- Asynchronous Queue: The backend processes resumes concurrently without freezing the UI.",
            "- Fraud Risk Detection: Built-in AI flags suspicious resumes.",
            "- Instant Comparisons: Select any two candidates for an AI-generated head-to-head comparison."
        ],
        "is_title": False
    },
    {
        "title": "Results & Performance",
        "content": [
            "- Time Saved: Reduces a 5-minute manual resume screen to < 3 seconds per candidate.",
            "- Ultra-Low Latency: By utilizing Groq's LPU infrastructure, LLM evaluations happen instantly.",
            "- Accuracy: Our custom 5-pillar scoring algorithm eliminates false positives.",
            "- Zero Torch Dependency: Lightweight, math-based backend engine ensures high performance."
        ],
        "is_title": False
    },
    {
        "title": "Technologies Used",
        "content": [
            "- Frontend: Next.js, React, Tailwind CSS, Framer Motion, React Dropzone.",
            "- Backend: Python, FastAPI, Pydantic, SQLAlchemy.",
            "- AI & NLP: Groq (Llama-3.3-70b-versatile), pdfplumber.",
            "- Deployment Setup: Ready for Vercel (Frontend) and Render (Backend)."
        ],
        "is_title": False
    },
    {
        "title": "Future Scope",
        "content": [
            "- Automated Video Interview analysis.",
            "- Integration with LinkedIn and GitHub for automatic portfolio verification.",
            "- ATS (Applicant Tracking System) API integrations.",
            "",
            "**Live Demo Link:** [Insert your Vercel Link here]"
        ],
        "is_title": False
    },
    {
        "title": "Thank You",
        "content": [],
        "is_title": False,
        "is_end": True
    }
]

pdf = PresentationPDF()

for s in slides:
    pdf.add_slide(
        title=s["title"], 
        content_lines=s["content"], 
        is_title_slide=s.get("is_title", False),
        is_end_slide=s.get("is_end", False)
    )

output_path = r"d:\data ana ai hackathon\TalentLens_AI_Pitch_Deck.pdf"
pdf.output(output_path)
print(f"Presentation saved to {output_path}")
