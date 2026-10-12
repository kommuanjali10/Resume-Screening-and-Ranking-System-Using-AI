import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import {
  Award,
  Search,
  Filter,
  Eye,
  Briefcase,
  Trophy,
  Medal,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

export const Ranking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

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
        setError('Failed to fetch jobs.');
      }
    };
    fetchJobs();
  }, []);

  const fetchRankings = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getRankings(selectedJobId, {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search || undefined,
        sortBy: 'matchScore',
        order: sortOrder,
      });

      if (res.success) {
        setRankings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch ranking leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchRankings();
    }
  }, [selectedJobId, statusFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRankings();
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-black text-xs ring-2 ring-amber-300">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs ring-2 ring-slate-300">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-800 font-black text-xs ring-2 ring-amber-200">
          🥉 3
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Candidate Ranking Leaderboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Job-wise ranked applicant pool sorted by match score
          </p>
        </div>

        <button
          onClick={fetchRankings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Leaderboard
        </button>
      </div>

      {/* Filter and Job Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Job Select */}
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Select Position:
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} ({job.department})
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates or skills..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Shortlisted">Shortlisted Only</option>
                <option value="Under Review">Under Review</option>
                <option value="New">New</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
            >
              <ArrowUpDown className="w-3 h-3" />
              Score: {sortOrder === 'desc' ? 'High to Low' : 'Low to High'}
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            Total Ranked: <strong className="text-slate-700">{rankings.length}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No candidate rankings available for this position"
            description="Run screening to generate deterministic match scores and calculate real candidate rankings."
            actionLabel="Run Screening"
            onAction={() => navigate(`/screening?jobId=${selectedJobId}`)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-6 text-center">Match Score</th>
                  <th className="py-3.5 px-6">Skills Matched</th>
                  <th className="py-3.5 px-6">Skill Gaps</th>
                  <th className="py-3.5 px-4 text-center">Experience</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.map((item) => {
                  const cand = item.candidate;
                  if (!cand) return null;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition">
                      {/* Rank */}
                      <td className="py-4 px-4 text-center font-bold">
                        <div className="flex justify-center">{getRankBadge(item.rank)}</div>
                      </td>

                      {/* Candidate info */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-sm">{cand.name}</div>
                        <div className="text-slate-500 mt-0.5">{cand.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{cand.education}</div>
                      </td>

                      {/* Match Score */}
                      <td className="py-4 px-6 text-center min-w-36">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-slate-900 text-base">{item.matchScore}%</span>
                          <ScoreGauge score={item.matchScore} size="sm" showLabel={false} />
                        </div>
                      </td>

                      {/* Skills Matched */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {item.matchedSkills?.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              ✓ {skill}
                            </span>
                          ))}
                          {(!item.matchedSkills || item.matchedSkills.length === 0) && (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Skill Gaps */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {item.missingSkills?.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              ✗ {skill}
                            </span>
                          ))}
                          {(!item.missingSkills || item.missingSkills.length === 0) && (
                            <span className="text-emerald-600 font-medium">None (Full Coverage)</span>
                          )}
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-slate-800">{cand.experience} yrs</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={cand.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/candidates/${cand._id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
