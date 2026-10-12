import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Branding */}
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs shadow-sm">
              AI
            </span>
            Resume Screening and Ranking System Using AI
          </span>
        </div>
      </div>

      {/* Recruiter Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800">{user?.name || 'Recruiter'}</span>
            <span className="text-[11px] text-slate-500 capitalize">{user?.role || 'Recruiter'}</span>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-medium"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
