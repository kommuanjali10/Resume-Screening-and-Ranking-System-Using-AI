import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = (val) => {
    switch (val) {
      case 'Selected':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20';
      case 'Shortlisted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
      case 'New':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20';
      case 'Active':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20';
      case 'Draft':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${getBadgeStyle(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          status === 'Selected'
            ? 'bg-purple-500'
            : status === 'Shortlisted' || status === 'Active'
            ? 'bg-emerald-500'
            : status === 'Applied'
            ? 'bg-blue-500'
            : status === 'Under Review'
            ? 'bg-amber-500'
            : status === 'Rejected'
            ? 'bg-rose-500'
            : 'bg-indigo-500'
        }`}
      />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
