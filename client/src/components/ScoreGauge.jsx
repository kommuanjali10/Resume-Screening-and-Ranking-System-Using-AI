import React from 'react';

export const ScoreGauge = ({ score, size = 'md', showLabel = true }) => {
  const numScore = typeof score === 'number' ? score : Number(score) || 0;

  const getColor = (s) => {
    if (s >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (s >= 65) return { text: 'text-blue-600', bg: 'bg-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-200' };
    if (s >= 50) return { text: 'text-amber-600', bg: 'bg-amber-500', lightBg: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-rose-600', bg: 'bg-rose-500', lightBg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const colors = getColor(numScore);

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full ${colors.bg}`}
            style={{ width: `${Math.min(100, Math.max(0, numScore))}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${colors.text}`}>{numScore}%</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${colors.border} ${colors.lightBg} shadow-sm`}>
        <div className="relative flex items-center justify-center w-28 h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={colors.text}
              strokeDasharray={`${numScore}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${colors.text}`}>{numScore}%</span>
            <span className="text-[10px] uppercase font-semibold text-slate-500">Match</span>
          </div>
        </div>
        {showLabel && (
          <div className="mt-3 text-center">
            <span className={`text-sm font-semibold ${colors.text}`}>
              {numScore >= 80 ? 'High Match' : numScore >= 65 ? 'Moderate Match' : numScore >= 50 ? 'Borderline Match' : 'Low Match'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default 'md'
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-slate-600">Match Score</span>
        <span className={`font-bold ${colors.text}`}>{numScore}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
          style={{ width: `${Math.min(100, Math.max(0, numScore))}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreGauge;
