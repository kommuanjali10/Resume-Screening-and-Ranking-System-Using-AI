import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import {
  FileCheck2,
  Sparkles,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  BookOpen,
  FolderGit2,
  Clock,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';

export const ScreeningResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [jobData, setJobData] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screeningActive, setScreeningActive] = useState(false);
  const [error, setError] = useState('');

  // Fetch jobs list
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.getJobs();
        if (res.success && res.data.length > 0) {
          setJobs(res.data);
          if (!selectedJobId) {
            setSelectedJobId(res.data[0]._id);
          }
        }
      } catch (err) {
        setError('Failed to load jobs list.');
      }
    };
    fetchJobs();
  }, []);

  // Fetch results when selectedJobId changes
  const fetchResults = async (jobId) => {
    if (!jobId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getScreeningResults(jobId);
      if (res.success) {
        setJobData(res.job);
        setResults(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch screening results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchResults(selectedJobId);
    }
  }, [selectedJobId]);

  const handleRunScreening = async () => {
    if (!selectedJobId) return;
    setScreeningActive(true);
    setError('');
    try {
      const res = await api.startScreening(selectedJobId);
      if (res.success) {
        setJobData(res.job);
        setResults(res.data);
      }
    } catch (err) {
      setError(err.message || 'Screening computation failed.');
    } finally {
      setScreeningActive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Screening Results & Explanation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transparent breakdown of multi-factor screening calculations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunScreening}
            disabled={screeningActive || !selectedJobId}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${screeningActive ? 'animate-spin' : ''}`} />
            Re-run Screening Engine
          </button>
          <button
            onClick={() => navigate(`/rankings?jobId=${selectedJobId}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            View Job Leaderboard
          </button>
        </div>
      </div>

      {/* Methodological Transparency Callout */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                Screening Engine Methodology
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Deterministic mathematical scoring: Skills Match (50%), Experience Match (20%), Education Match (10%), Certifications (10%), and Projects (10%). Match scores are algorithmic decision-support estimates. Recruiters make all final hiring decisions.
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-[11px] text-slate-400 block">Total Screened Candidates</span>
          <span className="text-2xl font-black text-white">{results.length}</span>
        </div>
      </div>

      {/* Job Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Briefcase className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Selected Job Requisition:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full sm:w-80 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
          >
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.department})
              </option>
            ))}
          </select>
        </div>

        {jobData && (
          <div className="text-xs text-slate-500">
            Min Experience: <strong className="text-slate-800">{jobData.minimumExperience} yrs</strong> | Required Skills: <strong className="text-slate-800">{jobData.requiredSkills?.length || 0}</strong>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Candidate Screening Result Cards */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading screening calculations...</div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No candidates screened for this job yet"
          description="Register or upload candidates for this job and click 'Re-run Screening Engine' to evaluate them."
          actionLabel="Upload Candidates"
          onAction={() => navigate(`/screening?jobId=${selectedJobId}`)}
        />
      ) : (
        <div className="space-y-5">
          {results.map((result) => {
            const cand = result.candidateId;
            if (!cand) return null;

            return (
              <div
                key={result._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 overflow-hidden"
              >
                {/* Header info */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg border border-indigo-100">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-slate-900">{cand.name}</h3>
                        <StatusBadge status={cand.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{cand.email} • {cand.phone || 'No phone'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                        <span>🎓 {cand.education}</span>
                        <span>•</span>
                        <span>💼 {cand.experience} Year(s) Experience</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] font-semibold uppercase text-slate-400 block">Overall Score</span>
                      <span className="text-3xl font-black text-slate-900">{result.matchScore}%</span>
                    </div>
                    <ScoreGauge score={result.matchScore} size="lg" showLabel={false} />
                  </div>
                </div>

                {/* Component Breakdown Progress Bars */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Skills Score (50%) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700">Skills (50%)</span>
                      <span className="font-bold text-indigo-600">{result.skillsScore}/50</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${(result.skillsScore / 50) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Experience Score (20%) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700">Experience (20%)</span>
                      <span className="font-bold text-blue-600">{result.experienceScore}/20</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${(result.experienceScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Education Score (10%) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700">Education (10%)</span>
                      <span className="font-bold text-amber-600">{result.educationScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: `${(result.educationScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Certifications (10%) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700">Certs (10%)</span>
                      <span className="font-bold text-emerald-600">{result.certificationScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${(result.certificationScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Projects (10%) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700">Projects (10%)</span>
                      <span className="font-bold text-purple-600">{result.projectScore}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${(result.projectScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Matched Skills */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matched Skills ({result.matchedSkills?.length || 0})
                    </h4>
                    {result.matchedSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No required skills matched.</span>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-rose-700">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Missing Required Skills ({result.missingSkills?.length || 0})
                    </h4>
                    {result.missingSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            ✗ {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-semibold">
                        ✓ All required skills matched!
                      </span>
                    )}
                  </div>
                </div>

                {/* Strengths & Skill Gaps */}
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Strengths */}
                  <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-2">
                      Demonstrated Strengths
                    </span>
                    <ul className="space-y-1 text-slate-700">
                      {result.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skill Gaps */}
                  <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100">
                    <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] block mb-2">
                      Identified Skill Gaps
                    </span>
                    <ul className="space-y-1 text-slate-700">
                      {result.skillGaps?.length > 0 ? (
                        result.skillGaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500 italic">No significant gaps detected.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Explanation & Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex-1 text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Recommendation:</strong>{' '}
                    <span className="font-semibold text-indigo-700">{result.recommendation}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/candidates/${cand._id}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-xl transition border border-transparent hover:border-slate-200"
                  >
                    View Explainable Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScreeningResults;
