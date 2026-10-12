import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { StatusBadge } from '../components/StatusBadge';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Award,
  FolderGit2,
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Info,
  Calendar,
  Building2,
  HelpCircle,
} from 'lucide-react';

export const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState('');

  const fetchCandidateDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getCandidate(id);
      if (res.success) {
        setCandidate(res.data);
        setScreeningResult(res.data.screeningResult);
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidate details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    setStatusSuccess('');
    try {
      await api.updateCandidate(id, { status: newStatus });
      setCandidate((prev) => ({ ...prev, status: newStatus }));
      setStatusSuccess(`Candidate status updated to "${newStatus}" and persisted in MongoDB.`);
      setTimeout(() => setStatusSuccess(''), 3000);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading candidate profile & score explanation...</div>;
  }

  if (error || !candidate) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-rose-600 text-sm font-semibold mb-4">{error || 'Candidate not found.'}</p>
        <button
          onClick={() => navigate('/candidates')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
        >
          Return to Candidate Database
        </button>
      </div>
    );
  }

  const job = candidate.jobId || {};

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Applicant Status:</span>
          <select
            value={candidate.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdating}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
          >
            <option value="Applied">Applied</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {statusSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusSuccess}</span>
        </div>
      )}

      {/* Candidate Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-md shadow-indigo-100">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{candidate.name}</h1>
              <StatusBadge status={candidate.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.phone}
                </span>
              )}
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <Briefcase className="w-3.5 h-3.5" />
                Applied for: {job.title || 'General Pool'}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Display */}
        {screeningResult && (
          <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Rule Engine Score
              </span>
              <span className="text-3xl font-black text-slate-900">
                {screeningResult.matchScore}%
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 block">
                {screeningResult.matchScore >= 80 ? 'High Match' : screeningResult.matchScore >= 65 ? 'Moderate Match' : 'Borderline/Low'}
              </span>
            </div>
            <ScoreGauge score={screeningResult.matchScore} size="lg" showLabel={false} />
          </div>
        )}
      </div>

      {/* Grid: Left Column (Profile & Resume) | Right Column (Explainable Screening) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Candidate Profile Details */}
        <div className="space-y-6">
          {/* Education & Experience */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Credentials & Experience
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Education</span>
                <span className="text-slate-800 font-bold mt-0.5 block">{candidate.education}</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Job Requirement: {job.education || 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Total Experience</span>
                <span className="text-slate-800 font-bold mt-0.5 block">{candidate.experience} Year(s)</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Job Minimum Requirement: {job.minimumExperience || 0} Year(s)
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Skills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Registered Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Certifications ({candidate.certifications?.length || 0})
            </h3>
            {candidate.certifications?.length > 0 ? (
              <ul className="space-y-1.5">
                {candidate.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-400 italic">No certifications listed.</span>
            )}
          </div>

          {/* Resume Document Metadata */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Attached Resume Document
            </h3>

            {candidate.resumeFile ? (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="font-semibold text-slate-800 truncate">
                  {candidate.resumeFile.originalName || candidate.resumeFile.filename}
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>Type: {candidate.resumeFile.mimetype || 'Document'}</div>
                  <div>Size: {(candidate.resumeFile.size / 1024).toFixed(1)} KB</div>
                  <div>Stored Path: <code className="text-indigo-600">{candidate.resumeFile.path}</code></div>
                </div>
                <a
                  href={`/${candidate.resumeFile.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download / View Resume
                </a>
              </div>
            ) : (
              <span className="text-slate-400 italic">No resume file attached.</span>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Explainable Screening Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {screeningResult ? (
            <>
              {/* Score Component Breakdown Cards */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Deterministic Score Component Breakdown
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">Total: 100%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Skills (50%) */}
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                    <span className="text-indigo-700 font-semibold block">Required Skills</span>
                    <span className="text-xl font-black text-indigo-900 mt-1 block">
                      {screeningResult.skillsScore}
                      <span className="text-xs font-normal text-slate-400"> / 50 pts</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Weight: 50%</span>
                  </div>

                  {/* Experience (20%) */}
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                    <span className="text-blue-700 font-semibold block">Experience</span>
                    <span className="text-xl font-black text-blue-900 mt-1 block">
                      {screeningResult.experienceScore}
                      <span className="text-xs font-normal text-slate-400"> / 20 pts</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Weight: 20%</span>
                  </div>

                  {/* Education (10%) */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs">
                    <span className="text-amber-700 font-semibold block">Education</span>
                    <span className="text-xl font-black text-amber-900 mt-1 block">
                      {screeningResult.educationScore}
                      <span className="text-xs font-normal text-slate-400"> / 10 pts</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Weight: 10%</span>
                  </div>

                  {/* Certifications (10%) */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                    <span className="text-emerald-700 font-semibold block">Certifications</span>
                    <span className="text-xl font-black text-emerald-900 mt-1 block">
                      {screeningResult.certificationScore}
                      <span className="text-xs font-normal text-slate-400"> / 10 pts</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Weight: 10%</span>
                  </div>

                  {/* Projects (10%) */}
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
                    <span className="text-purple-700 font-semibold block">Projects</span>
                    <span className="text-xl font-black text-purple-900 mt-1 block">
                      {screeningResult.projectScore}
                      <span className="text-xs font-normal text-slate-400"> / 10 pts</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Weight: 10%</span>
                  </div>
                </div>

                {/* Score Formula Visualization */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono text-slate-700">
                  Total Match = {screeningResult.skillsScore} (skills) + {screeningResult.experienceScore} (exp) + {screeningResult.educationScore} (edu) + {screeningResult.certificationScore} (certs) + {screeningResult.projectScore} (projects) = <strong className="text-indigo-700 font-bold">{screeningResult.matchScore}%</strong>
                </div>
              </div>

              {/* Skills Match Comparison */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Job Skill Coverage Comparison</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="font-bold text-emerald-800 block mb-2">
                      Matched Required Skills ({screeningResult.matchedSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {screeningResult.matchedSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-100 text-emerald-800"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                    <span className="font-bold text-rose-800 block mb-2">
                      Missing Required Skills ({screeningResult.missingSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {screeningResult.missingSkills?.length > 0 ? (
                        screeningResult.missingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg font-semibold bg-rose-100 text-rose-800"
                          >
                            ✗ {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Full Skill Requirements Met
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvement Areas */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Strengths & Skill Gap Diagnostics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-2">
                      Candidate Strengths
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      {screeningResult.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100">
                    <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] block mb-2">
                      Skill Gaps & Deficits
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      {screeningResult.skillGaps?.length > 0 ? (
                        screeningResult.skillGaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{gap}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 italic">No significant gaps detected.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Natural Language Explanation Paragraph */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  Transparent Scoring Explanation
                </h3>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {screeningResult.explanation}
                </p>

                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                      Recruiter Assessment Recommendation
                    </span>
                    <span className="text-sm font-bold text-indigo-900 mt-0.5 block">
                      {screeningResult.recommendation}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No screening calculations on file</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                This candidate has not yet been evaluated by the screening engine.
              </p>
              <button
                onClick={() => navigate(`/screening?jobId=${job._id}`)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
              >
                Screen Candidates for this Job
              </button>
            </div>
          )}

          {/* Candidate Projects List */}
          {candidate.projects?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-purple-600" />
                Portfolio Projects ({candidate.projects.length})
              </h3>
              <div className="space-y-3">
                {candidate.projects.map((proj, pIdx) => (
                  <div key={pIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900 block">{proj.title}</span>
                    {proj.description && (
                      <p className="text-slate-600 mt-1">{proj.description}</p>
                    )}
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;
