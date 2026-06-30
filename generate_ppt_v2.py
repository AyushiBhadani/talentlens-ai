from fpdf import FPDF
import os

class PresentationPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="L", unit="mm", format=(297, 167))
        self.set_auto_page_break(auto=False)
        
    def add_title_slide(self):
        self.add_page()
        # Use Slide 1 background
        self.image(r"d:\data ana ai hackathon\bg_slide1.png", x=0, y=0, w=297, h=167)
        
        # Add text for Team Name, Leader, Problem Statement
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(0, 0, 0)
        
        # Position over the fields in Slide 1
        # The fields are at the bottom half (approx y=90 to 120)
        self.set_xy(45, 83) 
        self.cell(0, 5, "TalentLens AI", ln=True)
        
        self.set_xy(55, 92)
        self.cell(0, 5, "Ayushi Bhadani", ln=True)
        
        self.set_font("Helvetica", "", 11)
        self.set_xy(53, 102)
        self.multi_cell(230, 6, "HR teams spend up to 15 hours manually screening resumes. Traditional keyword matching is flawed, leading to missed talent. We need an AI solution that understands context.")

    def add_content_slide(self, title, content_lines, is_last=False):
        self.add_page()
        # Use Slide 2 background
        if is_last:
            self.image(r"d:\data ana ai hackathon\bg_slide1.png", x=0, y=0, w=297, h=167)
            # Cover the bottom half with the gradient color or black to make it look clean
            self.set_fill_color(0, 0, 0)
            self.rect(0, 80, 297, 87, style="F")
            
            self.set_font("Helvetica", "B", 36)
            self.set_text_color(255, 255, 255)
            self.set_xy(0, 110)
            self.cell(297, 20, "THANK YOU", ln=True, align="C")
            return

        self.image(r"d:\data ana ai hackathon\bg_slide2.png", x=0, y=0, w=297, h=167)
        
        # Draw a white rectangle to cover the original "Solution Overview" text
        self.set_fill_color(255, 255, 255)
        # Header is about 15-20mm tall. Bottom gradient line is about 5mm tall.
        self.rect(0, 25, 297, 135, style="F")
        
        # Write Title
        self.set_xy(15, 30)
        self.set_font("Helvetica", "B", 20)
        self.set_text_color(20, 20, 30) # Dark gray/black
        self.cell(0, 15, title, ln=True, align="L")
        
        # Write Content
        self.set_xy(20, 50)
        self.set_font("Helvetica", "", 14)
        self.set_text_color(50, 50, 50)
        
        for line in content_lines:
            line = line.replace("—", "-").replace("'", "'").replace('"', '"').replace("•", "-")
            if line.startswith("**"):
                self.set_font("Helvetica", "B", 14)
                self.cell(0, 8, line.replace("**", ""), ln=True)
                self.set_font("Helvetica", "", 14)
            elif line.startswith("-") or line.startswith("*"):
                self.set_x(25)
                # Use a simple purple text color for bullets to match their design (they had purple dots)
                self.set_text_color(112, 48, 160) # Purple
                self.cell(5, 7, "-", ln=False)
                self.set_text_color(50, 50, 50)
                self.multi_cell(250, 7, line[1:].strip())
                self.ln(2)
            else:
                self.set_x(20)
                self.multi_cell(250, 7, line)
                self.ln(2)

slides = [
    {
        "title": "JD Understanding & Candidate Evaluation",
        "content": [
            "- Dynamic JD Parsing: We use AI to understand the intent and deep context of the JD.",
            "- Smart Candidate Profiling: Resumes are parsed using NLP to build structured candidate profiles.",
            "- Beyond Keywords: If a JD asks for 'Machine Learning' and a resume says 'Trained Neural Networks',",
            "  our AI knows it's a match."
        ]
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
        ]
    },
    {
        "title": "The LENS Assistant (Unique Feature)",
        "content": [
            "Conversational AI for Recruiters:",
            "- Interactive Chat: Recruiters can chat with our LENS Assistant (powered by Groq).",
            "- Context-Aware: The AI knows all the candidates in the database.",
            "- Use Cases:",
            "  - 'Who is the best candidate for the Python Intern role?'",
            "  - 'Draft a polite rejection email for Rahul.'",
            "  - 'What are 3 technical interview questions I should ask Karthik?'"
        ]
    },
    {
        "title": "System Architecture",
        "content": [
            "- Frontend: Next.js (React) dashboard with seamless Drag & Drop multi-file uploads.",
            "- Backend: FastAPI (Python) asynchronous server ensuring non-blocking, high-speed API responses.",
            "- AI Engine: Groq API running Llama-3.3-70b for lightning-fast semantic evaluation.",
            "- Data Flow: Resume Upload -> Text Extraction -> Structuring -> Scoring Engine -> Dashboard."
        ]
    },
    {
        "title": "Scalability & Workflow",
        "content": [
            "- Bulk Processing: Recruiters can upload 10, 50, or 100 resumes at once.",
            "- Asynchronous Queue: The backend processes resumes concurrently without freezing the UI.",
            "- Fraud Risk Detection: Built-in AI flags suspicious resumes.",
            "- Instant Comparisons: Select any two candidates for an AI-generated head-to-head comparison."
        ]
    },
    {
        "title": "Results & Performance",
        "content": [
            "- Time Saved: Reduces a 5-minute manual resume screen to < 3 seconds per candidate.",
            "- Ultra-Low Latency: By utilizing Groq's LPU infrastructure, LLM evaluations happen instantly.",
            "- Accuracy: Our custom 5-pillar scoring algorithm eliminates false positives.",
            "- Zero Torch Dependency: Lightweight, math-based backend engine ensures high performance."
        ]
    },
    {
        "title": "Technologies Used",
        "content": [
            "- Frontend: Next.js, React, Tailwind CSS, Framer Motion, React Dropzone.",
            "- Backend: Python, FastAPI, Pydantic, SQLAlchemy.",
            "- AI & NLP: Groq (Llama-3.3-70b-versatile), pdfplumber.",
            "- Deployment Setup: Ready for Vercel (Frontend) and Render (Backend)."
        ]
    },
    {
        "title": "Future Scope",
        "content": [
            "- Automated Video Interview analysis.",
            "- Integration with LinkedIn and GitHub for automatic portfolio verification.",
            "- ATS (Applicant Tracking System) API integrations.",
            "",
            "**Live Demo Link:** https://talentlens-ai.vercel.app/"
        ]
    }
]

pdf = PresentationPDF()
# Slide 1 (Title/Problem)
pdf.add_title_slide()

# Slide 2-9 (Content)
for s in slides:
    pdf.add_content_slide(s["title"], s["content"])

# Slide 10 (Thank you)
pdf.add_content_slide("", [], is_last=True)

output_path = r"d:\data ana ai hackathon\TalentLens_AI_Pitch_Deck_Final.pdf"
pdf.output(output_path)
print(f"Presentation saved to {output_path}")
