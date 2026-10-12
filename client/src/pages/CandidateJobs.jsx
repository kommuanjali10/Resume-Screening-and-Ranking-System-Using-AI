import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  Award,
} from 'lucide-react';

export const CandidateJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null); // for details modal
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applyResult, setApplyResult] = useState(null); // for success modal
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobsAndApplications();
  }, []);

  const fetchJobsAndApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.getCandidateJobs(),
        api.getMyApplications(),
      ]);

      if (jobsRes.success) {
        setJobs(jobsRes.data || []);
      }
      if (appsRes.success) {
        setApplications(appsRes.data || []);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  // Set of job IDs the candidate has applied to
  const appliedJobMap = new Map();
  applications.forEach((app) => {
    const jId = app.jobId?._id || app.jobId;
    if (jId) {
      appliedJobMap.set(jId.toString(), app);
    }
  });

  const departments = ['All', ...new Set(jobs.map((j) => j.department).filter(Boolean))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()) ||
      (job.requiredSkills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === 'All' || job.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleApply = async (job) => {
    // Check if resume is uploaded
    const hasResume = !!(user?.resumeFile?.filename || user?.resumeFile);
    if (!hasResume) {
      setError('Please upload your resume in the Profile section before applying for jobs.');
      return;
    }

    setApplyingJobId(job._id);
    setError('');
    try {
      const res = await api.applyJob(job._id);
      if (res.success) {
        setApplyResult({
          job,
          screeningResult: res.screeningResult,
          message: res.message,
        });
        // Refresh application state
        const updatedApps = await api.getMyApplications();
        if (updatedApps.success) {
          setApplications(updatedApps.data || []);
        }
      }
    } catch (err) {
      console.error('Apply error:', err);
      setError(err.message || 'Failed to submit application.');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Available Job Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified job openings published by recruiters and apply with your uploaded resume
          </p>
        </div>

        {/* Upload Resume Shortcut */}
        <Link
          to="/candidate/profile"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition self-start sm:self-auto"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>My Resume: {user?.resumeFile ? 'Uploaded ✓' : 'Upload Now'}</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {error.includes('upload your resume') && (
            <Link
              to="/candidate/profile"
              className="text-xs font-bold underline hover:text-rose-900 whitespace-nowrap ml-3"
            >
              Go to Profile →
            </Link>
          )}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, skill (e.g. React, Python), or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Listing */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Loading Open Positions...</span>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No matching jobs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or clearing department filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const appliedApp = appliedJobMap.get(job._id.toString());
            const isApplied = !!appliedApp;

            return (
              <div
                key={job._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        {job.department || 'General'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {job.title}
                      </h3>
                    </div>

                    {isApplied && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Applied ({appliedApp.status})
                      </span>
                    )}
                  </div>

                  {/* Requirements Summary */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2 mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Min. {job.minimumExperience || 0} yrs experience
                    </span>
                    {job.education && (
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {job.education}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.requiredSkills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                  >
                    View Full Job Description
                  </button>

                  {isApplied ? (
                    <Link
                      to="/candidate/applications"
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                    >
                      <span>View Results ({appliedApp.screeningResult?.matchScore || 0}%)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleApply(job)}
                      disabled={applyingJobId === job._id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs disabled:opacity-60 transition"
                    >
                      {applyingJobId === job._id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Screening...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>1-Click Apply</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  {selectedJob.department || 'General'}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedJob.title}</h2>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs sm:text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Job Description & Responsibilities</h4>
                <p className="whitespace-pre-line leading-relaxed text-slate-600">
                  {selectedJob.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">
                    Experience Required
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedJob.minimumExperience} Years
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">
                    Required Qualification
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedJob.education || 'Degree in relevant field'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedJob.requiredSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {selectedJob.preferredSkills?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Preferred / Nice-to-Have Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.preferredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>

              {appliedJobMap.has(selectedJob._id.toString()) ? (
                <Link
                  to="/candidate/applications"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  View My Application
                </Link>
              ) : (
                <button
                  onClick={() => {
                    const j = selectedJob;
                    setSelectedJob(null);
                    handleApply(j);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md transition"
                >
                  Apply with My Resume
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instant Screening Results Success Modal */}
      {applyResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1">
              You applied for <strong className="text-slate-700">{applyResult.job?.title}</strong>
            </p>

            {/* Match Score Display */}
            <div className="my-6 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Instant AI Job Match Score
              </span>
              <div className="text-4xl font-black text-indigo-900 my-1">
                {applyResult.screeningResult?.matchScore || 0}%
              </div>
              <p className="text-xs text-slate-600">
                Status:{' '}
                <strong className="text-slate-800">
                  {applyResult.screeningResult?.status || 'Applied'}
                </strong>
              </p>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="text-left space-y-3 mb-6 text-xs">
              <div>
                <span className="font-bold text-emerald-700 block mb-1">
                  Matched Skills ({applyResult.screeningResult?.matchedSkills?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {(applyResult.screeningResult?.matchedSkills || []).map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {applyResult.screeningResult?.missingSkills?.length > 0 && (
                <div>
                  <span className="font-bold text-amber-700 block mb-1">
                    Missing Skills / Skill Gaps ({applyResult.screeningResult.missingSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {applyResult.screeningResult.missingSkills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setApplyResult(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
              <Link
                to="/candidate/applications"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow transition"
              >
                <span>View Full Ranking & Applications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;
