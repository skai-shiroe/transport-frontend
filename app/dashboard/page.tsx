'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import StatCard from '@/app/components/StatCard';

interface DashboardData {
    vehiculesCount: number;
    chauffeursCount: number;
    activeAssignments: number;
    totalBalance: number;
    recentBLs: any[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        vehiculesCount: 0,
        chauffeursCount: 0,
        activeAssignments: 0,
        totalBalance: 0,
        recentBLs: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [vehicules, chauffeurs, affectations, caisses, bls] = await Promise.all([
                    api<any[]>('/vehicules'),
                    api<any[]>('/chauffeurs'),
                    api<any[]>('/affectations'),
                    api<any[]>('/caisses'),
                    api<any[]>('/bons-livraison')
                ]);

                const activeAff = affectations.filter(a => a.statut === 'EN_COURS').length;
                const totalBal = caisses.reduce((sum, c) => sum + c.reste, 0);

                setData({
                    vehiculesCount: vehicules.length,
                    chauffeursCount: chauffeurs.length,
                    activeAssignments: activeAff,
                    totalBalance: totalBal,
                    recentBLs: bls.slice(0, 5),
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">
                        Content de vous revoir, {user?.prenom} !
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Voici un résumé de l'activité de votre flotte.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Véhicules" 
                    value={loading ? '-' : data.vehiculesCount} 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>}
                    color="indigo"
                />
                <StatCard 
                    title="Chauffeurs" 
                    value={loading ? '-' : data.chauffeursCount} 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    color="emerald"
                />
                <StatCard 
                    title="Affectations Actives" 
                    value={loading ? '-' : data.activeAssignments} 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                    color="blue"
                />
                <StatCard 
                    title="Solde Caisses" 
                    value={loading ? '-' : `${(data.totalBalance || 0).toLocaleString()} FCFA`} 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-display font-semibold text-slate-800">Derniers Bons de Livraison</h2>
                        <button className="text-xs font-bold text-indigo-600 hover:indigo-700 transition-colors uppercase tracking-widest">Voir tout</button>
                    </div>
                    <div className="soft-card overflow-hidden">
                        <div className="p-2">
                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                                </div>
                            ) : data.recentBLs.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-sm italic">Aucun bon de livraison récent.</div>
                            ) : (
                                <div className="divide-y divide-soft-border">
                                    {data.recentBLs.map((bl) => (
                                        <div key={bl.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-xl group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{bl.numero}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-medium">{bl.lieu_chargement} → {bl.lieu_livraison}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-900">{(bl.montant || 0).toLocaleString()} FCFA</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{bl.date_chargement ? new Date(bl.date_chargement).toLocaleDateString() : '-'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts / Info */}
                <div className="space-y-6">
                    <h2 className="text-lg font-display font-semibold text-slate-800">Actions Rapides</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <button className="flex items-center gap-3 p-4 bg-white border border-soft-border rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group">
                             <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                             </div>
                             <span className="text-sm font-semibold text-slate-700">Nouveau Bon de Livraison</span>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-white border border-soft-border rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group">
                             <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             </div>
                             <span className="text-sm font-semibold text-slate-700">Enregistrer une Dépense</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
