import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound, Mail, Sparkles, UserCheck, AlertCircle, ArrowLeft, Repeat } from 'lucide-react';

export const CandidateLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, 'candidate');
      navigate('/candidate/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setEmail('alex.rivera@example.com');
    setPassword('Password123!');
    setLoading(true);
    try {
      await login('alex.rivera@example.com', 'Password123!', 'candidate');
      navigate('/candidate/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed. Ensure MongoDB is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Return to portal choice */}
      <div className="mb-6 w-full max-w-md flex items-center justify-between">
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

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-4">
          <UserCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Candidate Portal Login
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Resume Screening and Ranking System Using AI
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@example.com"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 transition"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Candidate Portal
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">Fast Access</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100/70 transition"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            One-Click Demo Candidate Login
          </button>

          {/* Credentials Helper */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 font-medium">Demo Candidate Account:</p>
            <p className="text-xs font-mono text-slate-700 mt-0.5">
              alex.rivera@example.com / <span className="font-semibold">Password123!</span>
            </p>
          </div>

          {/* Register Prompt */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/candidate/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Register as Candidate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
