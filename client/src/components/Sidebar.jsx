import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  Users,
  Award,
  Layers,
  ChevronRight,
  Repeat,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/recruiter/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
    },
    {
      to: '/recruiter/jobs',
      label: 'Job Management',
      icon: Briefcase,
      description: 'Requisitions & specs',
    },
    {
      to: '/recruiter/screening',
      label: 'Resume Screening',
      icon: FileCheck2,
      description: 'Upload & score engine',
    },
    {
      to: '/recruiter/candidates',
      label: 'Candidate Database',
      icon: Users,
      description: 'Profiles & applications',
    },
    {
      to: '/recruiter/rankings',
      label: 'Candidate Ranking',
      icon: Award,
      description: 'Job-wise leaderboards',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100 font-black text-sm">
              AI
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900">Recruiter Portal</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Recruitment Suite
              </span>
            </div>
          </div>

          {/* Navigation list */}
          <div className="px-3 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Recruiter Menu
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="leading-tight">{item.label}</span>
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-indigo-600" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom Switch Portal Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs"
          >
            <Repeat className="w-3.5 h-3.5 text-indigo-600" />
            <span>Switch Portal</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
