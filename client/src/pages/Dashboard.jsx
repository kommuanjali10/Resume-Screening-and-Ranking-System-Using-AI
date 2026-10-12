import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Briefcase,
  Users,
  FileCheck2,
  Award,
  PlusCircle,
  Upload,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    resumesScreened: 0,
    shortlistedCandidates: 0,
    recentActivities: [],
  });
  const [charts, setCharts] = useState({
    scoreDistribution: [],
    jobCandidates: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getDashboardCharts(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (chartsRes.success) setCharts(chartsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: 'Active Requisitions',
      action: () => navigate('/jobs'),
    },
    {
      label: 'Total Candidates',
      value: stats.totalCandidates,
      icon: Users,
      color: 'bg-indigo-500',
      lightBg: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      change: 'Stored in Database',
      action: () => navigate('/candidates'),
    },
    {
      label: 'Resumes Screened',
      value: stats.resumesScreened,
      icon: FileCheck2,
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      change: 'Rule-Engine Evaluated',
      action: () => navigate('/screening'),
    },
    {
      label: 'Shortlisted Candidates',
      value: stats.shortlistedCandidates,
      icon: Award,
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      change: 'High-Match Talents',
      action: () => navigate('/rankings'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recruiter Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time recruitment metrics and screening engine performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </button>
          <button
            onClick={() => navigate('/screening')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Screen Resumes
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={card.action}
            className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.lightBg} ${card.textColor}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 transition flex items-center gap-1">
                View Details <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? '...' : card.value}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-5 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Screening Workflow Quick Actions</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Rapid access to job creation, candidate upload, and ranking leaderboards.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            Create Job
          </button>
          <button
            onClick={() => navigate('/screening')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Upload Resumes
          </button>
          <button
            onClick={() => navigate('/candidates')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-amber-600" />
            View Candidates
          </button>
          <button
            onClick={() => navigate('/rankings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            View Rankings
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Candidate Score Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated candidates grouped by Rule-Based match score brackets
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Total: {stats.resumesScreened}</span>
          </div>

          <div className="h-64 w-full">
            {charts.scoreDistribution.length === 0 || stats.resumesScreened === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No screened candidates recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => [`${val} Candidate(s)`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {charts.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Shortlisted vs Rejected Status Distribution */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                Candidate Application Status Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportion of candidates by hiring workflow stage
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Total: {stats.totalCandidates}</span>
          </div>

          <div className="h-64 w-full">
            {stats.totalCandidates === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No candidates registered yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {charts.statusDistribution.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => [`${val} Candidates`, 'Status']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Job-Wise Candidate Count & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job-wise candidates bar chart */}
        <div className="lg:col-span-2 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Job-Wise Candidate Volume
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of total applications vs screened candidates per job
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            {charts.jobCandidates.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No active job positions found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.jobCandidates} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
                  />
                  <Legend verticalAlign="top" align="right" height={30} />
                  <Bar dataKey="candidates" name="Total Candidates" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="screened" name="Screened" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Recent Activity
              </h3>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Database Log</span>
            </div>

            <div className="space-y-3">
              {stats.recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent activities recorded.
                </div>
              ) : (
                stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {act.message}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
