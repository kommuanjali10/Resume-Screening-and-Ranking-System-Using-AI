import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { EmptyState } from '../components/EmptyState';
import {
  Users,
  Search,
  Filter,
  FileText,
  Eye,
  CheckCircle2,
  Trash2,
  Building2,
  Briefcase,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';

export const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [minExp, setMinExp] = useState('');

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [candRes, jobsRes] = await Promise.all([
        api.getCandidates({
          jobId: selectedJob !== 'All' ? selectedJob : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          search: search || undefined,
          minExperience: minExp || undefined,
        }),
        api.getJobs(),
      ]);

      if (candRes.success) setCandidates(candRes.data);
      if (jobsRes.success) setJobs(jobsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJob, selectedStatus, minExp]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await api.updateCandidate(candidateId, { status: newStatus });
      // Update local state smoothly
      setCandidates((prev) =>
        prev.map((c) => (c._id === candidateId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await api.deleteCandidate(candidateId);
      setCandidates((prev) => prev.filter((c) => c._id !== candidateId));
    } catch (err) {
      alert(`Failed to delete candidate: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Candidate Database
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse candidate profiles, resume attachments, application statuses, and computed match scores
          </p>
        </div>

        <button
          onClick={() => navigate('/screening')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
        >
          <Users className="w-4 h-4" />
          Add Candidate / Upload Resumes
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, email, or skill keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Filter by Job */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Job:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
            >
              <option value="All">All Jobs</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Filter by Min Experience */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Min Exp (Yrs):</span>
            <input
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
            />
          </div>

          <div className="ml-auto text-slate-400 text-[11px]">
            Found <span className="font-bold text-slate-700">{candidates.length}</span> candidate(s)
          </div>
        </div>
      </div>

      {/* Candidate Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading candidate records...</div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No candidate profiles found"
            description="Upload candidate resumes or add candidate profiles to start building your talent pool."
            actionLabel="Add Candidate"
            onAction={() => navigate('/recruiter/screening')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Candidate Profile</th>
                  <th className="py-3.5 px-6">Applied Job Position</th>
                  <th className="py-3.5 px-6">Key Skills</th>
                  <th className="py-3.5 px-6 text-center">Match Score</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-50/50 transition">
                    {/* Candidate Name & Info */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 text-sm">{cand.name}</div>
                      <div className="text-slate-500 mt-0.5">{cand.email}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{cand.education}</span>
                        <span>•</span>
                        <span>{cand.experience} yrs exp</span>
                      </div>
                    </td>

                    {/* Applied Job */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-medium text-slate-800">
                        {cand.jobId?.title || 'Unknown Position'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cand.jobId?.department || ''}
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {cand.skills?.slice(0, 4).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {cand.skills?.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{cand.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="py-4 px-6 text-center">
                      {cand.matchScore !== null && cand.matchScore !== undefined ? (
                        <ScoreGauge score={cand.matchScore} size="sm" />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not Screened</span>
                      )}
                    </td>

                    {/* Application Status with Interactive Dropdown */}
                    <td className="py-4 px-6">
                      <select
                        value={cand.status}
                        onChange={(e) => handleStatusChange(cand._id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Applied">Applied</option>
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/recruiter/candidates/${cand._id}`)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View Full Profile & Score Explanation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(cand._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
