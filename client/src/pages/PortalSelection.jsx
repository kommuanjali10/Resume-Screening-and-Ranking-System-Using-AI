import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Briefcase,
  FileText,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';

export const PortalSelection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate, isRecruiter, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm shadow-md shadow-indigo-100">
              AI
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                Resume Screening and Ranking System Using AI
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Dual-Portal Recruitment & Applicant Evaluation Platform
              </p>
            </div>
          </div>

          {/* User state indicator */}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-medium text-slate-600">
                Logged in as <strong className="text-slate-800">{user?.name}</strong> ({user?.role})
              </span>
              <button
                onClick={() =>
                  navigate(isCandidate ? '/candidate/dashboard' : '/recruiter/dashboard')
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition"
              >
                Go to My Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero & Portal Options */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Select Your Portal to Get Started
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            AI-Driven Resume Screening, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Transparent Ranking & Hiring
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Choose whether you are a job seeker looking to apply and view your transparent AI match scores,
            or a recruiter seeking to manage job requisitions and evaluate talent.
          </p>
        </div>

        {/* Portals Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          {/* Card 1: Candidate Portal */}
          <div className="relative group bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-400 p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                  For Job Seekers
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Candidate Portal
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Register, create your profile, upload your resume, apply for open positions, and view your
                transparent AI screening scores, ranking, and skill gap feedback.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-2.5">
                {[
                  'Create candidate account & profile',
                  'Upload resumes in PDF or DOCX format',
                  'Browse recruiter job postings with detailed requirements',
                  '1-Click apply using uploaded resume',
                  'View transparent 0-100% screening score and job ranking',
                  'Identify matched skills and missing skill gaps to improve',
                  'Private & isolated candidate dashboard',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={() => navigate('/candidate/login')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-100 transition"
              >
                <span>Candidate Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/candidate/register')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/60 text-blue-700 font-semibold text-sm hover:bg-blue-100/70 transition"
              >
                <span>Create Candidate Account</span>
              </button>
            </div>
          </div>

          {/* Card 2: Recruiter Portal */}
          <div className="relative group bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-500 p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
                  For Hiring Teams
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Recruiter Portal
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Publish job requisitions, upload candidate resumes, trigger automated multi-dimensional
                screening, review applicant leaderboards, and update hiring statuses.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-2.5">
                {[
                  'Secure recruiter access with authentication',
                  'Post, edit, and manage job openings & specs',
                  'Batch resume upload & automated parsing',
                  '5-Factor transparent scoring engine (Skills, Exp, Edu, etc.)',
                  'Job-wise applicant ranking and leaderboards',
                  'Update candidate statuses (Shortlisted, Selected, Rejected)',
                  'Analytics dashboard and screening metrics',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={() => navigate('/recruiter/login')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
              >
                <span>Recruiter Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/recruiter/register')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-700 font-semibold text-sm hover:bg-indigo-100/70 transition"
              >
                <span>Register Recruiter Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transparent Scoring Engine Summary */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-5xl mx-auto w-full shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Transparent AI Evaluation Weights
                </h4>
                <p className="text-xs text-slate-500">
                  Every applicant is evaluated deterministically against verifiable criteria
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Bias-Free Scoring
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xl font-extrabold text-indigo-600">50%</span>
              <span className="text-xs font-semibold text-slate-700">Skills Match</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Required & Preferred</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xl font-extrabold text-blue-600">20%</span>
              <span className="text-xs font-semibold text-slate-700">Experience</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Years & seniority</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xl font-extrabold text-sky-600">10%</span>
              <span className="text-xs font-semibold text-slate-700">Education</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Degree relevance</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xl font-extrabold text-teal-600">10%</span>
              <span className="text-xs font-semibold text-slate-700">Certifications</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Industry credentials</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xl font-extrabold text-violet-600">10%</span>
              <span className="text-xs font-semibold text-slate-700">Projects</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Practical evidence</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            Resume Screening and Ranking System Using AI
          </p>
          <p className="mt-1">
            Department of Computer Science & Engineering • Major Project Final Implementation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PortalSelection;
