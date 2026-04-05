'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "indigo" | "emerald" | "rose" | "amber" | "blue";
  delay?: number;
}

export default function StatCard({ title, value, icon, trend, color = "indigo", delay = 0 }: StatCardProps) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="soft-card p-6 flex flex-col gap-4 relative overflow-hidden group"
    >
      {/* Decorative background element */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 duration-500 ${colorClasses[color].split(' ')[0]}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-3 rounded-2xl border ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={trend.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
            </svg>
            {trend.value}%
          </div>
        )}
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
        <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
            <p className="text-[10px] text-slate-400 font-medium">vs mois dernier</p>
        )}
      </div>
    </motion.div>
  );
}
