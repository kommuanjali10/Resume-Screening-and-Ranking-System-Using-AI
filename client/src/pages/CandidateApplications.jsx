import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FileCheck2,
  Award,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMyApplications();
      if (res.success) {
        setApplications(res.data || []);
        if (res.data?.length > 0) {
          setSelectedApp(res.data[0]); // default select the first one
        }
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Shortlisted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Your Applications & Results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Applications & AI Screening Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your candidate application status, transparent 5-pillar scores, and skill gap improvement insights
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Private Candidate View</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchApplications} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-4">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            When you apply for jobs, your transparent screening score, rank, and skill gap analysis will appear here.
          </p>
          <Link
            to="/candidate/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow transition"
          >
            <span>Browse Job Postings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Applications List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Applications ({applications.length})
            </h2>

            <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
              {applications.map((app) => {
                const isSelected = selectedApp?._id === app._id;
                const score = app.screeningResult?.matchScore ?? 0;

                return (
                  <div
                    key={app._id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {app.jobId?.title || 'Job Opening'}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status || 'Applied'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2">
                      {app.jobId?.department || 'Engineering'} • Applied{' '}
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently'}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">Score:</span>
                        <span className="text-xs font-black text-slate-900">{score}%</span>
                      </div>
                      {app.rank && (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          Rank #{app.rank}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Screening Analysis for Selected Application (8 cols) */}
          {selectedApp && (
            <div className="lg:col-span-8 space-y-6">
              {/* Selected Job Banner & Score Header */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      {selectedApp.jobId?.department || 'Department'}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {selectedApp.jobId?.title || 'Position'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Applied on{' '}
                      {selectedApp.createdAt
                        ? new Date(selectedApp.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recently'}
                    </p>
                  </div>

                  {/* Application Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusBadge(
                        selectedApp.status
                      )}`}
                    >
                      Status: {selectedApp.status || 'Applied'}
                    </span>
                  </div>
                </div>

                {/* Score & Rank Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                  {/* Overall Match Score Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">
                        Overall Match Score
                      </span>
                      <div className="text-3xl font-black text-indigo-900 mt-0.5">
                        {selectedApp.screeningResult?.matchScore ?? 0}%
                      </div>
                      <span className="text-[11px] text-slate-600 mt-1 block">
                        Calculated using transparent 5-factor weighting
                      </span>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/80 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-xs">
                      {selectedApp.screeningResult?.matchScore ?? 0}/100
                    </div>
                  </div>

                  {/* Job Rank Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                        Job-Specific Ranking
                      </span>
                      <div className="text-3xl font-black text-amber-900 mt-0.5">
                        {selectedApp.rank ? `#${selectedApp.rank}` : '1'}
                        <span className="text-xs font-semibold text-amber-700 ml-1.5">
                          of {selectedApp.totalApplicants || '1'} applicants
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 mt-1 block">
                        Position among candidates who applied for this role
                      </span>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/80 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                      <Award className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* 5-Pillar Score Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    5-Pillar Score Breakdown
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-500 block">Skills</span>
                      <span className="text-sm font-extrabold text-blue-700">
                        {selectedApp.screeningResult?.skillsScore ?? 0} / 50
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">50% weight</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-500 block">Experience</span>
                      <span className="text-sm font-extrabold text-indigo-700">
                        {selectedApp.screeningResult?.experienceScore ?? 0} / 20
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">20% weight</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-500 block">Education</span>
                      <span className="text-sm font-extrabold text-sky-700">
                        {selectedApp.screeningResult?.educationScore ?? 0} / 10
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">10% weight</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-500 block">Certifications</span>
                      <span className="text-sm font-extrabold text-teal-700">
                        {selectedApp.screeningResult?.certificationScore ?? 0} / 10
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">10% weight</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-500 block">Projects</span>
                      <span className="text-sm font-extrabold text-purple-700">
                        {selectedApp.screeningResult?.projectScore ?? 0} / 10
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">10% weight</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Analysis: Matched Skills vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Matched Skills ({selectedApp.screeningResult?.matchedSkills?.length || 0})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Skills detected in your profile/resume that fulfill this job's requirements:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedApp.screeningResult?.matchedSkills || []).length > 0 ? (
                      selectedApp.screeningResult.matchedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills matched yet.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills / Skill Gaps */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Missing Skills / Skill Gaps ({selectedApp.screeningResult?.missingSkills?.length || 0})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Required skills you could develop or add to your resume to increase your score:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedApp.screeningResult?.missingSkills || []).length > 0 ? (
                      selectedApp.screeningResult.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
                        >
                          ! {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold">
                        All required skills were matched! Fantastic job!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Explanation & Recommendations */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Transparent Evaluation Feedback
                  </h3>
                </div>

                {selectedApp.screeningResult?.explanation && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="block font-bold text-slate-900 mb-1">Score Breakdown Details:</strong>
                    {selectedApp.screeningResult.explanation}
                  </div>
                )}

                {selectedApp.screeningResult?.recommendation && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <strong className="block font-bold text-indigo-950 mb-1">Recommendation Note:</strong>
                    {selectedApp.screeningResult.recommendation}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateApplications;
