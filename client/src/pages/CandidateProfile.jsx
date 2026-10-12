import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Code2,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Download,
  Save,
  Check,
} from 'lucide-react';

export const CandidateProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    experience: 0,
    skills: '',
    certifications: '',
  });

  const [resumeData, setResumeData] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getCandidateProfile();
      if (res.success && res.data) {
        const u = res.data;
        setFormData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          education: u.education || '',
          experience: u.experience ?? 0,
          skills: Array.isArray(u.skills) ? u.skills.join(', ') : u.skills || '',
          certifications: Array.isArray(u.certifications)
            ? u.certifications.join(', ')
            : u.certifications || '',
        });
        setResumeData(u.resumeFile || null);
        if (Array.isArray(u.skills)) {
          setExtractedSkills(u.skills);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMsg(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const certsArray = formData.certifications
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await api.updateCandidateProfile({
        name: formData.name,
        phone: formData.phone,
        education: formData.education,
        experience: Number(formData.experience) || 0,
        skills: skillsArray,
        certifications: certsArray,
      });

      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        if (res.data) {
          updateUser(res.data);
          setExtractedSkills(res.data.skills || []);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const uploadFormData = new FormData();
    uploadFormData.append('resume', file);

    try {
      const res = await api.uploadCandidateResume(uploadFormData);
      if (res.success) {
        setSuccessMsg(res.message || 'Resume uploaded and processed successfully!');
        setResumeData(res.resumeFile);
        if (res.parsedSkills?.length > 0) {
          // If new skills were detected, merge or show them
          setExtractedSkills(res.user?.skills || res.parsedSkills);
          setFormData((prev) => ({
            ...prev,
            skills: (res.user?.skills || res.parsedSkills).join(', '),
          }));
        }
        if (res.user) {
          updateUser(res.user);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setErrorMsg(err.message || 'Failed to upload resume. Ensure file is PDF or DOCX.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Candidate Profile & Resume
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your credentials and upload your resume for automated screening and ranking
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resume Upload & Extracted Skills (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resume Upload Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Your Resume</h3>
            <p className="text-xs text-slate-500 mb-5">
              Upload your resume in PDF or DOCX format to auto-extract your skills
            </p>

            {resumeData ? (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 mb-5">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {resumeData.originalName || resumeData.filename || 'Uploaded Resume.pdf'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {resumeData.size ? `${(resumeData.size / 1024).toFixed(1)} KB • ` : ''}
                      Status: Active for applications
                    </p>

                    {resumeData.path && (
                      <a
                        href={`http://localhost:5000/${resumeData.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 mt-2"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download / View Resume</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-5">
                <AlertCircle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                No resume uploaded yet. Upload a resume to apply for positions.
              </div>
            )}

            {/* Upload Button & Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-file-input"
              />
              <label
                htmlFor="resume-file-input"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition ${
                  uploading
                    ? 'bg-slate-50 border-slate-300 pointer-events-none'
                    : 'border-blue-300 bg-blue-50/30 hover:bg-blue-50/70 hover:border-blue-500'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">
                      Parsing & uploading resume...
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-xs font-bold text-slate-800">
                      {resumeData ? 'Upload New Version' : 'Click to Upload Resume'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Supports PDF, DOCX (Max 10MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Extracted Skills Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Extracted Skills</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Skills detected by the screening parser to calculate job match scores:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {extractedSkills.length > 0 ? (
                extractedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No skills listed yet. Add them in the form or upload your resume.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Personal & Professional Info</h3>
            <p className="text-xs text-slate-500 mb-6">
              Keep your profile details current to ensure accurate screening calculations
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      name="email"
                      type="email"
                      disabled
                      value={formData.email}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative mt-1.5">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Years of Experience
                  </label>
                  <div className="relative mt-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      name="experience"
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.experience}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Degree / Education
                </label>
                <div className="relative mt-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    name="education"
                    type="text"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech in Computer Science and Engineering"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Core Skills */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Skills (Comma-Separated)
                </label>
                <div className="relative mt-1.5">
                  <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    name="skills"
                    rows={3}
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, JavaScript, MongoDB, Python, Express"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Certifications (Comma-Separated)
                </label>
                <input
                  name="certifications"
                  type="text"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="AWS Certified Developer, MongoDB Associate Developer"
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
