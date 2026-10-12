import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  FileCheck2,
  Eye,
  AlertCircle,
  Building2,
  GraduationCap,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requiredSkills: '',
    preferredSkills: '',
    minimumExperience: 0,
    education: '',
    status: 'Active',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getJobs();
      if (res.success) {
        setJobs(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setFormData({
      title: '',
      department: '',
      description: '',
      requiredSkills: '',
      preferredSkills: '',
      minimumExperience: 0,
      education: "Bachelor's Degree in Computer Science or related field",
      status: 'Active',
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      description: job.description,
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills,
      preferredSkills: Array.isArray(job.preferredSkills) ? job.preferredSkills.join(', ') : job.preferredSkills,
      minimumExperience: job.minimumExperience,
      education: job.education,
      status: job.status,
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const openViewModal = (job) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  const openDeleteModal = (job) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.department || !formData.requiredSkills || !formData.education) {
      setFormError('Please fill in title, department, required skills, and education.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createJob(formData);
      setIsCreateOpen(false);
      fetchJobs();
    } catch (err) {
      setFormError(err.message || 'Failed to create job.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    setSubmitting(true);
    try {
      await api.updateJob(selectedJob._id, formData);
      setIsEditOpen(false);
      fetchJobs();
    } catch (err) {
      setFormError(err.message || 'Failed to update job.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      await api.deleteJob(selectedJob._id);
      setIsDeleteOpen(false);
      fetchJobs();
    } catch (err) {
      setError(err.message || 'Failed to delete job.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = job.title?.toLowerCase().includes(q);
    const deptMatch = job.department?.toLowerCase().includes(q);
    const skillMatch = job.requiredSkills?.some((s) => s.toLowerCase().includes(q));
    return titleMatch || deptMatch || skillMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Job Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and maintain job descriptions, experience thresholds, and skill criteria
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, department, skills..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredJobs.length}</span> active requisitions
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading jobs from MongoDB...</div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No job requisitions found"
            description="Create your first job posting to begin screening and ranking candidate resumes."
            actionLabel="Create Job"
            onAction={openCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Job Title</th>
                  <th className="py-3.5 px-6">Required Skills</th>
                  <th className="py-3.5 px-6 text-center">Candidates</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition">
                    {/* Job Title & Department */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{job.title}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {job.department}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Min {job.minimumExperience} yr(s)
                        </span>
                      </div>
                    </td>

                    {/* Required Skills Badges */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills?.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Candidates Count */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900 text-base">{job.candidateCount || 0}</span>
                        <span className="text-[10px] text-slate-400">
                          {job.screenedCount || 0} screened
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge status={job.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/screening?jobId=${job._id}`)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Start Screening for this Job"
                      >
                        <FileCheck2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openViewModal(job)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                        title="View Job Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(job)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(job)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Job"
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

      {/* CREATE JOB MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Job Requisition">
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full Stack React & Node Developer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department / Company *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Engineering or Fintech Labs"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline role responsibilities, team context, and key deliverables..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Required Skills * (Comma-separated, 50% scoring weight)
            </label>
            <input
              type="text"
              required
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="React, Node.js, JavaScript, MongoDB, Express"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Preferred Skills (Optional, comma-separated)
            </label>
            <input
              type="text"
              value={formData.preferredSkills}
              onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
              placeholder="TypeScript, Docker, AWS, Redux"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Experience (Years) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={formData.minimumExperience}
                onChange={(e) => setFormData({ ...formData, minimumExperience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Education Requirement *</label>
            <input
              type="text"
              required
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="e.g. Bachelor's Degree in Computer Science or related field"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Job to MongoDB'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT JOB MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Job Requisition">
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department / Company *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Required Skills * (Comma-separated)
            </label>
            <input
              type="text"
              required
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Experience (Years) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={formData.minimumExperience}
                onChange={(e) => setFormData({ ...formData, minimumExperience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Education Requirement *</label>
            <input
              type="text"
              required
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW JOB DETAILS MODAL */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Job Specifications Overview">
        {selectedJob && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedJob.title}</h3>
                <span className="text-slate-500">{selectedJob.department}</span>
              </div>
              <StatusBadge status={selectedJob.status} />
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-1">Description</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedJob.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-1.5">Required Skills (50% Screening Weight)</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.requiredSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {selectedJob.preferredSkills?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 mb-1.5">Preferred Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.preferredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Experience Requirement</span>
                <span className="text-slate-800 font-bold mt-0.5 block text-sm">
                  {selectedJob.minimumExperience} Years Minimum
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Education Requirement</span>
                <span className="text-slate-800 font-bold mt-0.5 block text-sm">
                  {selectedJob.education}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              <span className="text-slate-400 font-mono text-[11px]">
                ID: {selectedJob._id}
              </span>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  navigate(`/screening?jobId=${selectedJob._id}`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Launch Resume Screening
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Job Deletion" maxWidth="max-w-md">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900">"{selectedJob?.title}"</strong>?
          </p>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 leading-relaxed">
            <strong>Warning:</strong> Deleting this job will cascade-delete all candidates and screening result documents associated with it in MongoDB.
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Job'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jobs;
