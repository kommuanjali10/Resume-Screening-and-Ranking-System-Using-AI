import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FileUp,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ResumeUpload = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId);
  const [selectedJob, setSelectedJob] = useState(null);

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Candidate Details Form State
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    education: "Bachelor's Degree in Computer Science",
    experience: 2,
    skills: '',
    certifications: '',
    projects: '',
    status: 'New',
  });
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [candidateSavedSuccess, setCandidateSavedSuccess] = useState('');

  // Screening status
  const [screeningLoading, setScreeningLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.getJobs();
        if (res.success) {
          setJobs(res.data);
          if (preselectedJobId) {
            const found = res.data.find((j) => j._id === preselectedJobId);
            if (found) setSelectedJob(found);
          } else if (res.data.length > 0) {
            setSelectedJobId(res.data[0]._id);
            setSelectedJob(res.data[0]);
          }
        }
      } catch (err) {
        setUploadError('Failed to load jobs list.');
      }
    };
    fetchJobs();
  }, [preselectedJobId]);

  const handleJobChange = (e) => {
    const jId = e.target.value;
    setSelectedJobId(jId);
    const found = jobs.find((j) => j._id === jId);
    setSelectedJob(found || null);
  };

  const handleFileDrop = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    setUploadSuccess('');
    setUploadLoading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Client-side file extension check
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (ext !== '.pdf' && ext !== '.docx') {
        setUploadError(`File ${file.name} is rejected. Only PDF and DOCX files are permitted.`);
        setUploadLoading(false);
        return;
      }
      formData.append('resumes', file);
    }

    try {
      const res = await api.uploadResumes(formData);
      if (res.success) {
        setUploadedFiles((prev) => [...prev, ...res.files]);
        setUploadSuccess(`Successfully uploaded ${res.count} document(s) to server/uploads/.`);
      }
    } catch (err) {
      setUploadError(err.message || 'File upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      setUploadError('Please select a target job position first.');
      return;
    }

    setSavingCandidate(true);
    setCandidateSavedSuccess('');
    setUploadError('');

    try {
      // Attach the latest uploaded resume file metadata if available
      const attachedFile = uploadedFiles.length > 0 ? uploadedFiles[uploadedFiles.length - 1] : null;

      const payload = {
        ...candidateForm,
        jobId: selectedJobId,
        resumeFile: attachedFile,
      };

      const res = await api.createCandidate(payload);
      if (res.success) {
        setCandidateSavedSuccess(
          `Candidate "${res.data.name}" profile and resume metadata saved to MongoDB!`
        );
        // Reset form for next candidate
        setCandidateForm({
          name: '',
          email: '',
          phone: '',
          education: selectedJob?.education || "Bachelor's Degree in Computer Science",
          experience: 2,
          skills: '',
          certifications: '',
          projects: '',
          status: 'New',
        });
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to save candidate profile.');
    } finally {
      setSavingCandidate(false);
    }
  };

  const handleStartScreening = async () => {
    if (!selectedJobId) {
      setUploadError('Please select a target job.');
      return;
    }

    setScreeningLoading(true);
    setUploadError('');

    try {
      const res = await api.startScreening(selectedJobId);
      if (res.success) {
        navigate(`/screening-results?jobId=${selectedJobId}`);
      }
    } catch (err) {
      setUploadError(err.message || 'Screening engine execution failed.');
    } finally {
      setScreeningLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resume Screening & Ingestion
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload candidate resumes (PDF/DOCX) and register verified profile information for Rule-Based scoring
          </p>
        </div>

        <button
          onClick={handleStartScreening}
          disabled={screeningLoading || !selectedJobId}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
        >
          {screeningLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Start Screening Engine
        </button>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Step 1: Select Target Job */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
            1
          </span>
          <h3 className="text-sm font-bold text-slate-900">Select Job Requisition</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Target Job Position
            </label>
            <select
              value={selectedJobId}
              onChange={handleJobChange}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} ({job.department}) — Min {job.minimumExperience} yrs exp
                </option>
              ))}
            </select>
          </div>

          {selectedJob && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-500 font-medium block">Job Matching Criteria:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedJob.requiredSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Upload Resume Files (PDF / DOCX) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900">Upload Resume Documents (PDF / DOCX)</h3>
          </div>
          <span className="text-[11px] text-slate-400">Multer Secure Storage (`server/uploads/`)</span>
        </div>

        {/* Drag & drop upload box */}
        <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition">
          <input
            type="file"
            multiple
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileDrop}
            className="hidden"
          />
          <div className="p-3 rounded-2xl bg-white shadow-xs text-indigo-600 mb-3 border border-slate-100">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-800">
            Click to upload or drag and drop candidate resumes
          </span>
          <span className="text-[11px] text-slate-400 mt-1">
            Accepts PDF and DOCX files only (Maximum 10 MB per file)
          </span>
        </label>

        {/* Uploaded Files Table */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">
              Uploaded Resume Files ({uploadedFiles.length})
            </div>
            <ul className="divide-y divide-slate-100">
              {uploadedFiles.map((file, idx) => (
                <li key={idx} className="px-4 py-2.5 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-800">{file.originalName}</span>
                    <span className="text-slate-400 text-[10px]">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Stored in uploads/
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Step 3: Verified Candidate Profile Ingestion Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Candidate Profile Data Ingestion
            </h3>
          </div>
        </div>

        {candidateSavedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{candidateSavedSuccess}</span>
          </div>
        )}

        <form onSubmit={handleCreateCandidate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Candidate Name *</label>
              <input
                type="text"
                required
                value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                placeholder="e.g. Jordan Miller"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={candidateForm.email}
                onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                placeholder="jordan.miller@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={candidateForm.phone}
                onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Education *</label>
              <input
                type="text"
                required
                value={candidateForm.education}
                onChange={(e) => setCandidateForm({ ...candidateForm, education: e.target.value })}
                placeholder="e.g. B.Tech in Computer Science / Master of Science"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Experience in Years * (20% Scoring Weight)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={candidateForm.experience}
                onChange={(e) => setCandidateForm({ ...candidateForm, experience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Candidate Skills * (Comma-separated, 50% Scoring Weight)
            </label>
            <input
              type="text"
              required
              value={candidateForm.skills}
              onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })}
              placeholder="React, Node.js, JavaScript, MongoDB, Express"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Certifications (Optional, comma-separated, 10% weight)
              </label>
              <input
                type="text"
                value={candidateForm.certifications}
                onChange={(e) => setCandidateForm({ ...candidateForm, certifications: e.target.value })}
                placeholder="AWS Certified Developer, MongoDB Associate"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Relevant Projects (Optional, line-separated, 10% weight)
              </label>
              <textarea
                rows={2}
                value={candidateForm.projects}
                onChange={(e) => setCandidateForm({ ...candidateForm, projects: e.target.value })}
                placeholder="E-Commerce API with Node/Express&#10;Analytics Dashboard with React"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={savingCandidate}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
              {savingCandidate ? 'Saving Candidate...' : 'Save Candidate & Attach Resume'}
            </button>
          </div>
        </form>
      </div>

      {/* Start Screening Engine Card */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
            Deterministic Evaluation
          </span>
          <h3 className="text-base font-bold mt-0.5">
            Ready to evaluate candidates against "{selectedJob?.title || 'Selected Job'}"?
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Executes the 5-factor Screening Engine: Required Skills (50%), Experience (20%), Education (10%), Certifications (10%), Projects (10%).
          </p>
        </div>

        <button
          onClick={handleStartScreening}
          disabled={screeningLoading || !selectedJobId}
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-900 bg-white rounded-xl hover:bg-indigo-50 transition shadow-md whitespace-nowrap"
        >
          {screeningLoading ? 'Computing Scores...' : 'Launch Screening'}
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </button>
      </div>
    </div>
  );
};

export default ResumeUpload;
