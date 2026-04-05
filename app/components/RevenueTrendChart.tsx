'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueTrendChartProps {
    data: { name: string; amount: number }[];
    loading?: boolean;
}

export default function RevenueTrendChart({ data, loading }: RevenueTrendChartProps) {
    if (loading) {
        return (
            <div className="soft-card p-6 h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="soft-card p-6 h-[350px] flex flex-col relative overflow-hidden group">
            {/* Background design */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Évolution du Chiffre d'Affaires</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Tendance des revenus sur les derniers mois (FCFA)</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip 
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }}
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid #e2e8f0', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                            formatter={(value: any) => [`${Number(value).toLocaleString()} FCFA`, 'CA Mensuel']}
                            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" // Creates the curve effect
                            dataKey="amount" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorAmount)" 
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
