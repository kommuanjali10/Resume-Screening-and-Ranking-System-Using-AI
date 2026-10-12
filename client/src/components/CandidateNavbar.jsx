import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  User,
  LogOut,
  Menu,
  X,
  Repeat,
  Sparkles,
} from 'lucide-react';

export const CandidateNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/candidate/jobs', label: 'Browse Jobs', icon: Briefcase },
    { to: '/candidate/applications', label: 'My Applications', icon: FileCheck },
    { to: '/candidate/profile', label: 'Profile & Resume', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <NavLink to="/candidate/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-sm">
                AI
              </span>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Resume Screening and Ranking System Using AI
                </span>
                <span className="text-[11px] font-semibold text-blue-600 tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Candidate Portal
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Switch Portal button */}
            <NavLink
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition"
              title="Switch to another portal"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Switch Portal</span>
            </NavLink>

            {/* Profile badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user?.name || 'Candidate'}</span>
                <span className="text-[10px] text-slate-500">{user?.email}</span>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-medium"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="px-3 py-1 text-xs text-slate-500">
              Signed in as: <strong className="text-slate-800">{user?.name}</strong>
            </div>
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Repeat className="w-4 h-4" />
              <span>Switch Portal</span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default CandidateNavbar;
