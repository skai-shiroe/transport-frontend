import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatCard({ title, value, icon, trend, color = "indigo" }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="soft-card p-6 flex items-start justify-between">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 underline decoration-soft-border underline-offset-4">{title}</p>
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-900">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 text-[10px] font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={trend.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
              </svg>
              {trend.value}%
              <span className="text-slate-400 font-medium ml-1">vs mois dernier</span>
            </div>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-2xl ${colorClasses[color] || colorClasses.indigo}`}>
        {icon}
      </div>
    </div>
  );
}
