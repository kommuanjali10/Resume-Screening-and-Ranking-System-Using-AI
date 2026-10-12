# Resume Screening and Ranking System Using AI

> **Final-Year Major Project**  
> A full-stack, AI-powered dual-portal recruitment platform designed for transparent candidate screening, job-matching, ranking, and hiring pipeline management.

---

## 1. Project Overview

The **Resume Screening and Ranking System Using AI** bridges the gap between job applicants and hiring recruiters. The application provides two distinct, secure, and isolated portals:

1. **Candidate Portal:** Allows candidates to create accounts, build their profiles, upload resumes (PDF/DOCX), browse open positions, apply with 1-click, and immediately inspect their transparent AI match score, job ranking, matched skills, and actionable skill gaps.
2. **Recruiter Portal:** Empowers hiring managers to publish and manage job requisitions, upload batches of candidate resumes, trigger the multi-dimensional AI screening engine, evaluate applicant leaderboards, and update recruitment statuses (`Applied`, `Under Review`, `Shortlisted`, `Selected`, `Rejected`).

The screening engine evaluates applicants deterministically against verified job criteria using a transparent 5-factor scoring model ($50\%$ Skills, $20\%$ Experience, $10\%$ Education, $10\%$ Certifications, $10\%$ Projects) with zero black-box bias.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3
- **Routing:** React Router v6 (Role-based layout guards)
- **Data Visualizations:** Recharts (Analytics, score distributions, applicant funnel)
- **Icons:** Lucide React
- **Language:** JavaScript (ES6+) & JSX
- **Backend:** Node.js & Express 4 (REST API, MVC Architecture)
- **Database:** MongoDB Community Server / MongoDB Atlas with Mongoose 8
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **File Ingestion:** Multer (Document validation for `.pdf`, `.docx`, max 10MB)
- **Persistence Inspection:** Direct inspection via MongoDB Compass / MongoDB Atlas

---

## 3. Dual-Portal Architecture

```
                          ┌─────────────────────────────────────┐
                          │         Landing Page ( / )          │
                          │      Portal Selection Screen        │
                          └──────────────┬──────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │     Candidate Portal      │                   │     Recruiter Portal      │
   │       ( /candidate )      │                   │       ( /recruiter )      │
   ├───────────────────────────┤                   ├───────────────────────────┤
   │ • Candidate Register/Login│                   │ • Recruiter Register/Login│
   │ • Profile & PDF Resume    │                   │ • Recruiter Dashboard     │
   │ • Browse Active Jobs      │                   │ • Job Management (CRUD)   │
   │ • 1-Click Application     │                   │ • Batch Resume Screening  │
   │ • Match Score & Breakdown │                   │ • Candidate Database      │
   │ • Job Rank (#1 of N)      │                   │ • Candidate Dossier View  │
   │ • Matched & Missing Skills│                   │ • Leaderboard & Ranking   │
   │ • Private Applicant View  │                   │ • Status Pipeline Updates │
   └───────────────────────────┘                   └───────────────────────────┘
```

---

## 4. Transparent AI Screening Formula

The screening engine (`server/services/scoringService.js`) calculates a verified match score from $0$ to $100\%$ using a weighted 5-factor formula:

$$\text{Total Score} = \text{Skills (50\%)} + \text{Experience (20\%)} + \text{Education (10\%)} + \text{Certifications (10\%)} + \text{Projects (10\%) }$$

1. **Skills Match ($50\%$ Weight):**
   $$\text{Skills Score} = \left(\frac{\text{Matched Required Skills}}{\text{Total Required Skills}}\right) \times 50$$
2. **Experience Match ($20\%$ Weight):**
   - Full $20$ points if candidate experience $\ge$ job minimum experience.
   - Proportional score $\left(\frac{\text{Candidate Exp}}{\text{Min Exp}}\right) \times 20$ if candidate experience $<$ minimum experience.
3. **Education Match ($10\%$ Weight):**
   - Evaluates degree qualification (Doctorate/PhD: 10, Master's: 10, Bachelor's: 10 if Bachelor's required / 7.5 if Master's required, Diploma: 5).
4. **Certifications Match ($10\%$ Weight):**
   - $2+$ relevant credentials: 10 points; 1 certification: 6 points; None: 0 points.
5. **Portfolio Projects Match ($10\%$ Weight):**
   - $2+$ relevant projects: 10 points; 1 project: 6 points; None: 0 points.

---

## 5. Project Directory Structure

```text
Resume-Screening-and-Ranking-System-Using-AI/
├── client/                               # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/                   # Navbar, Sidebar, CandidateNavbar, ScoreGauge, StatusBadge
│   │   ├── context/                      # AuthContext (JWT session, role guards, user state)
│   │   ├── pages/
│   │   │   ├── PortalSelection.jsx       # Landing page (Portal choice at /)
│   │   │   ├── CandidateLogin.jsx        # Candidate Sign In
│   │   │   ├── CandidateRegister.jsx     # Candidate Sign Up
│   │   │   ├── CandidateDashboard.jsx    # Candidate Hub, stats & recent applications
│   │   │   ├── CandidateJobs.jsx         # Browse jobs & 1-Click Apply
│   │   │   ├── CandidateApplications.jsx # Track scores, rank (#1 of N), matched & missing skills
│   │   │   ├── CandidateProfile.jsx      # Candidate Profile & PDF Resume upload
│   │   │   ├── RecruiterLogin.jsx        # Recruiter Sign In
│   │   │   ├── RecruiterRegister.jsx     # Recruiter Sign Up
│   │   │   ├── Dashboard.jsx             # Recruiter Analytics & Charts
│   │   │   ├── Jobs.jsx                  # Job Requisition Management (CRUD)
│   │   │   ├── ResumeUpload.jsx          # Batch resume ingestion & screening trigger
│   │   │   ├── Candidates.jsx            # Recruiter candidate database & status manager
│   │   │   ├── CandidateDetails.jsx      # Candidate profile dossier & resume viewer
│   │   │   ├── ScreeningResults.jsx      # Screening score breakdown & diagnostic report
│   │   │   └── Ranking.jsx               # Candidate leaderboard & ranking badges
│   │   ├── services/
│   │   │   └── api.js                    # Fetch HTTP client with network error handling
│   │   ├── App.jsx                       # Dual-portal routing & role guards
│   │   ├── main.jsx                      # React root entrypoint
│   │   └── index.css                     # Tailwind CSS directives
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── server/                               # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                         # Mongoose MongoDB connection
│   ├── controllers/
│   │   ├── authController.js             # Authentication (Login, Register, Profile)
│   │   ├── candidatePortalController.js  # Candidate jobs, applications, scores, resume upload
│   │   ├── candidateController.js        # Recruiter candidate management & status sync
│   │   ├── jobController.js              # Job requisitions CRUD
│   │   ├── resumeController.js           # Multer file handler & resume streamer
│   │   ├── screeningController.js        # Screening engine execution & persistence
│   │   ├── rankingController.js          # Recruiter applicant ranking generator
│   │   └── dashboardController.js        # Analytics aggregation & distribution charts
│   ├── middleware/
│   │   ├── authMiddleware.js             # JWT protect, requireRecruiter, requireCandidate
│   │   ├── uploadMiddleware.js           # Multer disk storage & file filter (.pdf, .docx)
│   │   └── errorMiddleware.js            # Centralized API error handler
│   ├── models/
│   │   ├── User.js                       # User schema (roles: candidate, recruiter, admin)
│   │   ├── Job.js                        # Job requisition schema
│   │   ├── Candidate.js                  # Candidate applicant schema
│   │   └── ScreeningResult.js            # Screening score & skill gap schema
│   ├── routes/                           # API Routes (/auth, /candidate, /jobs, /candidates, etc.)
│   ├── scripts/
│   │   └── seed.js                       # Database seed script (Recruiter + Candidate accounts)
│   ├── services/
│   │   └── scoringService.js             # Transparent 5-factor scoring algorithm
│   ├── uploads/                          # Resume storage directory (ignored in git)
│   ├── .env.example                      # Backend environment template
│   ├── package.json
│   └── server.js                         # Express server bootstrap
├── .env.example                          # Root environment template
├── .gitignore                            # Comprehensive git ignore file
├── package.json                          # Root scripts & orchestration
└── README.md                             # Documentation
```

---

## 6. Pre-Seeded Demo Credentials

The database can be seeded with realistic demonstration accounts:

### Recruiter Account
- **Email:** `recruiter@demo.com`
- **Password:** `Password123!`
- **Role:** `recruiter`
- *(Use the "One-Click Demo Recruiter Login" button on the Recruiter Sign In page)*

### Candidate Account
- **Email:** `alex.rivera@example.com`
- **Password:** `Password123!`
- **Role:** `candidate`
- *(Use the "One-Click Demo Candidate Login" button on the Candidate Sign In page)*

---

## 7. How to Push This Project to GitHub

Follow these steps in Windows PowerShell to publish this project to your GitHub account:

### Step 1: Create a New Repository on GitHub
1. Open your web browser and go to [https://github.com/new](https://github.com/new).
2. Set the **Repository name** to: `Resume-Screening-and-Ranking-System-Using-AI` (or any name you prefer).
3. Choose **Public** or **Private**.
4. **IMPORTANT:** Do **NOT** check "Add a README file", "Add .gitignore", or "Choose a license" (this project already includes them).
5. Click **Create repository**.
6. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/Resume-Screening-and-Ranking-System-Using-AI.git`).

---

### Step 2: Open Windows PowerShell in the Project Directory

```powershell
Set-Location "C:\Users\kommu\Documents\Resume-Screening-and-Ranking-System-Using-AI"
```

---

### Step 3: Configure Your Git Identity (If Not Already Configured)

Replace with your own name and email:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

### Step 4: Initialize Git & Stage Project Files

```powershell
# 1. Initialize local repository (if not already initialized)
git init

# 2. Stage all source files (node_modules, .env, and uploads are safely ignored by .gitignore)
git add .

# 3. Verify what is staged (optional check)
git status

# 4. Create your initial commit
git commit -m "feat: complete Resume Screening and Ranking System Using AI with dual portals"
```

---

### Step 5: Set the Main Branch and Add Remote Origin

Replace `YOUR_USERNAME` with your actual GitHub username:

```powershell
# 1. Rename default branch to main
git branch -M main

# 2. Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/Resume-Screening-and-Ranking-System-Using-AI.git
```

*(If you ever need to change the remote URL: `git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`)*

---

### Step 6: Push Code to GitHub

```powershell
git push -u origin main
```

#### GitHub Authentication Note:
When prompted for credentials:
- **Username:** Your GitHub username or email.
- **Password:** Use a **Personal Access Token (Classic)** with `repo` scope, or authenticate via the GitHub browser login window.
  - To generate a token: GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token → check `repo` scope → copy token.

---

## 8. How to Run the Project Locally

### Step 1: Start MongoDB
Ensure the local MongoDB service is running:
```powershell
Get-Service -Name '*MongoDB*'
# If stopped, start it:
Start-Service -Name 'MongoDB'
```

### Step 2: Install Dependencies
```powershell
Set-Location "C:\Users\kommu\Documents\Resume-Screening-and-Ranking-System-Using-AI"
npm.cmd install
cd server; npm.cmd install; cd ..
cd client; npm.cmd install; cd ..
```

### Step 3: Seed Sample Data
```powershell
cd server
npm.cmd run seed
cd ..
```

### Step 4: Run Backend & Frontend Concurrently
```powershell
npm.cmd start
```
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5173`

---

## 9. REST API Endpoints Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status and online health | Public |
| `GET` | `/api/health` | Server uptime and MongoDB status | Public |
| `POST` | `/api/auth/register` | Register new candidate or recruiter | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Authenticated |
| `GET` | `/api/candidate/jobs` | Browse active job openings | Candidate |
| `POST` | `/api/candidate/apply/:jobId` | 1-Click apply & auto-score resume | Candidate |
| `GET` | `/api/candidate/applications` | View own applications, scores & ranks | Candidate |
| `GET` | `/api/candidate/profile` | View candidate profile | Candidate |
| `PUT` | `/api/candidate/profile` | Update candidate profile & skills | Candidate |
| `POST` | `/api/candidate/resume` | Upload & parse candidate resume | Candidate |
| `GET` | `/api/jobs` | List all job requisitions | Recruiter |
| `POST` | `/api/jobs` | Create new job requisition | Recruiter |
| `PUT` | `/api/jobs/:id` | Update job requisition | Recruiter |
| `DELETE` | `/api/jobs/:id` | Delete job requisition | Recruiter |
| `GET` | `/api/candidates` | View recruiter candidate database | Recruiter |
| `GET` | `/api/candidates/:id` | View candidate dossier & resume | Recruiter |
| `PUT` | `/api/candidates/:id` | Update candidate status | Recruiter |
| `POST` | `/api/screening/:jobId` | Trigger screening engine on job candidates | Recruiter |
| `GET` | `/api/rankings/:jobId` | Get job-specific ranking leaderboard | Recruiter |
| `GET` | `/api/dashboard/stats` | Recruiter dashboard metrics | Recruiter |
| `GET` | `/api/dashboard/charts` | Score and status chart data | Recruiter |

---

## 10. College Project Review Checklist

- [x] Dual-portal recruitment platform (Candidate Portal & Recruiter Portal) with Portal Selection at `/`.
- [x] Strict project title: **Resume Screening and Ranking System Using AI**.
- [x] Candidate account registration, login, profile management, and PDF/DOCX resume uploading.
- [x] Active job postings browsing with complete specifications and qualifications.
- [x] 1-Click job application with immediate transparent screening score evaluation.
- [x] Candidate ranking computation (#1 of N applicants) and matched vs. missing skills analysis.
- [x] Recruiter pipeline management supporting `Applied`, `New`, `Under Review`, `Shortlisted`, `Selected`, and `Rejected` statuses.
- [x] MongoDB database persistence verified directly through MongoDB Compass / Atlas.
- [x] Zero build errors on Vite production build.
- [x] Clean Git repository prepared with `.gitignore` and `.env.example`.
