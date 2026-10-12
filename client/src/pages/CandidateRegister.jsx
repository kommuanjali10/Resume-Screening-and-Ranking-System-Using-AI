import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Mail,
  KeyRound,
  User,
  Phone,
  GraduationCap,
  Briefcase,
  Code2,
  AlertCircle,
  ArrowLeft,
  Repeat,
} from 'lucide-react';

export const CandidateRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    education: '',
    experience: '',
    skills: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'candidate',
        phone: formData.phone,
        education: formData.education,
        experience: Number(formData.experience) || 0,
        skills: skillsArray,
      });

      navigate('/candidate/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Return Navigation */}
      <div className="mb-6 w-full max-w-xl flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portal Selection</span>
        </Link>
        <Link
          to="/recruiter/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Switch to Recruiter Portal</span>
        </Link>
      </div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-4">
          <UserPlus className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Candidate Registration
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Create your profile to apply for jobs and get transparent AI screening scores
        </p>
      </div>

      {/* Register Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
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
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Years of Experience
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <input
                    name="experience"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Highest Degree / Education
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <input
                  name="education"
                  type="text"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech Computer Science and Engineering"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Key Skills (Comma-Separated)
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Code2 className="h-4 w-4" />
                </div>
                <input
                  name="skills"
                  type="text"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, JavaScript, MongoDB, Python"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                You can also upload your full resume (PDF/DOCX) after registering to auto-extract your qualifications.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 transition"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Candidate Account
                </>
              )}
            </button>
          </form>

          {/* Login prompt */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/candidate/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign In to Candidate Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateRegister;
