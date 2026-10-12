import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  Briefcase,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Upload,
  Clock,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appRes, profRes] = await Promise.all([
        api.getMyApplications(),
        api.getCandidateProfile(),
      ]);

      if (appRes.success) {
        setApplications(appRes.data || []);
      }
      if (profRes.success) {
        setProfile(profRes.data || {});
      }
    } catch (err) {
      console.error('Error fetching candidate dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const totalApplied = applications.length;
  const shortlistedCount = applications.filter((a) =>
    ['Shortlisted', 'Selected'].includes(a.status)
  ).length;

  const highestScore = applications.reduce((max, app) => {
    const score = app.screeningResult?.matchScore || 0;
    return score > max ? score : max;
  }, 0);

  const hasResume = !!(profile?.resumeFile?.filename || user?.resumeFile?.filename);
  const resumeName = profile?.resumeFile?.originalName || user?.resumeFile?.originalName || 'Uploaded Resume';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Candidate Overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Candidate Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Candidate'}!
          </h1>
          <p className="mt-1.5 text-sm text-blue-100 max-w-xl leading-relaxed">
            Track your job applications, view transparent AI screening scores, and inspect skill gaps to boost your job match rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/candidate/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-xs sm:text-sm font-bold shadow hover:bg-blue-50 transition"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse Jobs</span>
          </Link>
          <Link
            to="/candidate/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/40 text-white border border-white/30 text-xs sm:text-sm font-semibold hover:bg-blue-500/60 transition"
          >
            <FileText className="w-4 h-4" />
            <span>{hasResume ? 'Update Resume' : 'Upload Resume'}</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-bold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Applied */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Jobs Applied
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalApplied}</div>
          </div>
        </div>

        {/* Card 2: Shortlisted */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Shortlisted / Selected
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{shortlistedCount}</div>
          </div>
        </div>

        {/* Card 3: Top Match Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top Screening Score
            </span>
            <div className="text-2xl font-extrabold text-indigo-700 mt-0.5">
              {highestScore > 0 ? `${highestScore}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Card 4: Resume Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              hasResume ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {hasResume ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resume Status
            </span>
            <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
              {hasResume ? 'Active & Ready' : 'Pending Upload'}
            </div>
            <Link
              to="/candidate/profile"
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-block mt-0.5"
            >
              {hasResume ? 'View / Change' : 'Upload PDF now →'}
            </Link>
          </div>
        </div>
      </div>

      {/* Resume missing alert banner if not uploaded */}
      {!hasResume && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Upload your resume to apply for jobs</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Our AI screening engine extracts your skills, experience, and certifications directly from your resume to calculate transparent match scores.
              </p>
            </div>
          </div>
          <Link
            to="/candidate/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition whitespace-nowrap self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume Now</span>
          </Link>
        </div>
      )}

      {/* Recent Applications Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Recent Applications</h3>
            <p className="text-xs text-slate-500">Live screening status and transparent evaluation scores</p>
          </div>
          {applications.length > 0 && (
            <Link
              to="/candidate/applications"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">You haven't applied for any jobs yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Explore active job postings published by recruiters and submit your application with a single click.
            </p>
            <Link
              to="/candidate/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow transition"
            >
              <span>Explore Available Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Job Position</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">AI Match Score</th>
                  <th className="px-6 py-3.5">Current Rank</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.slice(0, 5).map((app) => {
                  const score = app.screeningResult?.matchScore ?? 0;
                  const rank = app.rank || '—';
                  const total = app.totalApplicants || '—';

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

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div>{app.jobId?.title || 'Job Opening'}</div>
                        <div className="text-[11px] font-normal text-slate-500">
                          {app.jobId?.department || 'General'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status || 'Applied'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{score}%</span>
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 75
                                  ? 'bg-emerald-500'
                                  : score >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {rank !== '—' ? (
                          <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
                            #{rank} <span className="text-[10px] text-slate-400 font-normal">of {total}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/candidate/applications"
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transparent Evaluation System Education */}
      <div className="bg-slate-100/70 rounded-3xl p-6 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          How Your Score is Calculated
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Our screening engine evaluates each candidate transparently against exact job requisitions across 5 dimensions:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="block text-sm font-extrabold text-blue-600">50 Pts</span>
            <span className="text-[11px] font-semibold text-slate-700">Skills Match</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="block text-sm font-extrabold text-indigo-600">20 Pts</span>
            <span className="text-[11px] font-semibold text-slate-700">Experience</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="block text-sm font-extrabold text-sky-600">10 Pts</span>
            <span className="text-[11px] font-semibold text-slate-700">Education</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="block text-sm font-extrabold text-teal-600">10 Pts</span>
            <span className="text-[11px] font-semibold text-slate-700">Certifications</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="block text-sm font-extrabold text-purple-600">10 Pts</span>
            <span className="text-[11px] font-semibold text-slate-700">Projects</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
