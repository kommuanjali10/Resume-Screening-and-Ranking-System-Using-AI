import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CandidateNavbar } from './components/CandidateNavbar';

// Landing & Auth Pages
import { PortalSelection } from './pages/PortalSelection';
import { CandidateLogin } from './pages/CandidateLogin';
import { CandidateRegister } from './pages/CandidateRegister';
import { RecruiterLogin } from './pages/RecruiterLogin';
import { RecruiterRegister } from './pages/RecruiterRegister';

// Candidate Portal Pages
import { CandidateDashboard } from './pages/CandidateDashboard';
import { CandidateJobs } from './pages/CandidateJobs';
import { CandidateApplications } from './pages/CandidateApplications';
import { CandidateProfile } from './pages/CandidateProfile';

// Recruiter Portal Pages
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { ResumeUpload } from './pages/ResumeUpload';
import { Candidates } from './pages/Candidates';
import { CandidateDetails } from './pages/CandidateDetails';
import { ScreeningResults } from './pages/ScreeningResults';
import { Ranking } from './pages/Ranking';

/**
 * Recruiter Portal Layout Wrapper with Sidebar & Navbar
 */
const RecruiterLayout = () => {
  const { isAuthenticated, isRecruiter, isCandidate, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Checking Recruiter Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/recruiter/login" replace />;
  }

  // If candidate mistakenly accesses recruiter layout, send them to candidate dashboard
  if (isCandidate && !isRecruiter) {
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Persistent Recruiter Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Recruiter Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="screening" element={<ResumeUpload />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:id" element={<CandidateDetails />} />
            <Route path="screening-results" element={<ScreeningResults />} />
            <Route path="rankings" element={<Ranking />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

/**
 * Candidate Portal Layout Wrapper with CandidateNavbar
 */
const CandidateLayout = () => {
  const { isAuthenticated, isCandidate, isRecruiter, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Checking Candidate Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/candidate/login" replace />;
  }

  // If recruiter mistakenly accesses candidate layout without candidate role, send them to recruiter dashboard
  if (isRecruiter && !isCandidate) {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <CandidateNavbar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="jobs" element={<CandidateJobs />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

/**
 * Intelligent redirector for legacy generic paths
 */
const GenericRedirect = ({ target }) => {
  const { isAuthenticated, isCandidate, isRecruiter } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isCandidate) {
    if (target === 'jobs') return <Navigate to="/candidate/jobs" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  if (target === 'jobs') return <Navigate to="/recruiter/jobs" replace />;
  if (target === 'screening') return <Navigate to="/recruiter/screening" replace />;
  if (target === 'candidates') return <Navigate to="/recruiter/candidates" replace />;
  if (target === 'rankings') return <Navigate to="/recruiter/rankings" replace />;

  return <Navigate to="/recruiter/dashboard" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing First Page: Portal Selection */}
          <Route path="/" element={<PortalSelection />} />

          {/* Auth Routes */}
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/candidate/register" element={<CandidateRegister />} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/register" element={<RecruiterRegister />} />
          <Route path="/login" element={<Navigate to="/recruiter/login" replace />} />

          {/* Candidate Portal Routes */}
          <Route path="/candidate/*" element={<CandidateLayout />} />

          {/* Recruiter Portal Routes */}
          <Route path="/recruiter/*" element={<RecruiterLayout />} />

          {/* Backward compatibility redirects */}
          <Route path="/dashboard" element={<GenericRedirect target="dashboard" />} />
          <Route path="/jobs" element={<GenericRedirect target="jobs" />} />
          <Route path="/screening" element={<GenericRedirect target="screening" />} />
          <Route path="/candidates" element={<GenericRedirect target="candidates" />} />
          <Route path="/rankings" element={<GenericRedirect target="rankings" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
