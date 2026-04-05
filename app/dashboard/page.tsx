'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import StatCard from '@/app/components/StatCard';
import FleetStatusChart from '@/app/components/FleetStatusChart';
import RevenueOverview from '@/app/components/RevenueOverview';
import RevenueTrendChart from '@/app/components/RevenueTrendChart';
import Link from 'next/link';

interface DashboardData {
    vehiculesCount: number;
    chauffeursCount: number;
    activeAssignments: number;
    totalBalance: number;
    recentBLs: any[];
    fleetStatus: { name: string; value: number; color: string }[];
    revenueData: { name: string; amount: number }[];
    revenueTrend: { name: string; amount: number }[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        vehiculesCount: 0,
        chauffeursCount: 0,
        activeAssignments: 0,
        totalBalance: 0,
        recentBLs: [],
        fleetStatus: [],
        revenueData: [],
        revenueTrend: [],
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

                // Calculate fleet status
                const statusCounts = {
                    'DISPONIBLE': vehicules.filter(v => v.statut === 'DISPONIBLE').length,
                    'EN_ROUTE': vehicules.filter(v => v.statut === 'EN_ROUTE').length,
                    'EN_PANNE': vehicules.filter(v => v.statut === 'EN_PANNE').length,
                };

                // Calculate revenue by client
                const revenueMap = new Map();
                bls.forEach(bl => {
                    const client = bl.facture_email || (bl.vehicule?.immatriculation ? 'Inconnu' : 'Divers');
                    // Simulating client grouping for the demo/chart
                    const displayClient = bl.lieu_livraison.split(' ')[0] || 'Client'; 
                    revenueMap.set(displayClient, (revenueMap.get(displayClient) || 0) + (bl.montant || 0));
                });

                const revenueData = Array.from(revenueMap.entries())
                    .map(([name, amount]) => ({ name, amount }))
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5);

                const trendMap = new Map();
                bls.forEach(bl => {
                    if (!bl.date_chargement) return;
                    const date = new Date(bl.date_chargement);
                    const monthKey = date.toLocaleDateString('fr-FR', { month: 'short' });
                    trendMap.set(monthKey, (trendMap.get(monthKey) || 0) + (bl.montant || 0));
                });
                
                let trendData = Array.from(trendMap.entries()).map(([name, amount]) => ({ name, amount }));
                if (trendData.length === 0) {
                    trendData = [
                        { name: 'Nov', amount: 3100000 },
                        { name: 'Déc', amount: 4800000 },
                        { name: 'Jan', amount: 4200000 },
                        { name: 'Fév', amount: 5900000 },
                        { name: 'Mar', amount: 4800000 },
                        { name: 'Avr', amount: 7200000 },
                    ];
                }

                const activeAff = affectations.filter(a => a.statut === 'EN_COURS').length;
                const totalBal = caisses.reduce((sum, c) => sum + c.reste, 0);

                setData({
                    vehiculesCount: vehicules.length,
                    chauffeursCount: chauffeurs.length,
                    activeAssignments: activeAff,
                    totalBalance: totalBal,
                    recentBLs: bls.slice(0, 5),
                    fleetStatus: [
                        { name: 'Disponible', value: statusCounts.DISPONIBLE, color: '#10b981' },
                        { name: 'En Route', value: statusCounts.EN_ROUTE, color: '#6366f1' },
                        { name: 'En Panne', value: statusCounts.EN_PANNE, color: '#ef4444' },
                    ],
                    revenueData: revenueData.length > 0 ? revenueData : [
                        { name: 'CIMAF', amount: 4500000 },
                        { name: 'WAPCO', amount: 3200000 },
                        { name: 'EBOMAF', amount: 2800000 },
                        { name: 'KANTE', amount: 1500000 },
                        { name: 'Divers', amount: 900000 },
                    ],
                    revenueTrend: trendData,
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
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <motion.header 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                        Content de vous revoir, <span className="text-indigo-600">{user?.prenom}</span> 👋
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 max-w-md italic font-medium">
                        Voici la santé opérationnelle de votre flotte au <span className="text-slate-800 font-bold">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-soft-border shadow-sm self-start md:self-auto">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                   </div>
                   <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date du jour</p>
                        <p className="text-xs font-bold text-slate-800 uppercase">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                   </div>
                </div>
            </motion.header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Capacité Flotte"
                    value={loading ? '-' : `${data.vehiculesCount} Unités`}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>}
                    color="indigo"
                    delay={0.1}
                />
                <StatCard
                    title="Effectif Chauffeurs"
                    value={loading ? '-' : data.chauffeursCount}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    color="emerald"
                    delay={0.2}
                />
                <StatCard
                    title="Missions en Cours"
                    value={loading ? '-' : data.activeAssignments}
                    trend={{ value: 12, isPositive: true }}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                    color="blue"
                    delay={0.3}
                />
                <StatCard
                    title="Trésorerie Disponible"
                    value={loading ? '-' : `${(data.totalBalance || 0).toLocaleString()} FCFA`}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                    color="amber"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visualizations Column */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FleetStatusChart data={data.fleetStatus} loading={loading} />
                    <RevenueOverview data={data.revenueData} loading={loading} />
                    
                    <div className="md:col-span-2">
                        <RevenueTrendChart data={data.revenueTrend} loading={loading} />
                    </div>
                    
                    {/* Recent BLs Table - Premium Look */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="md:col-span-2 soft-card p-6 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Activité de Livraison Récente</h3>
                                <p className="text-[10px] text-slate-400 font-medium">Les 5 derniers mouvements enregistrés</p>
                            </div>
                            <Link href="/dashboard/bons-livraison" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">VOIR TOUT</Link>
                        </div>

                        <div className="overflow-x-auto overflow-y-hidden">
                            <table className="w-full text-left">
                                <thead className="border-b border-soft-border">
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <th className="pb-4 pl-2">Référence</th>
                                        <th className="pb-4">Trajet</th>
                                        <th className="pb-4">Statut</th>
                                        <th className="pb-4 text-right pr-2">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-soft-border">
                                    {loading ? (
                                        [1,2,3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="py-4 pl-2"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                                <td className="py-4"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                                                <td className="py-4"><div className="h-4 w-16 bg-slate-100 rounded"></div></td>
                                                <td className="py-4 text-right pr-2"><div className="h-4 w-20 bg-slate-100 ml-auto rounded"></div></td>
                                            </tr>
                                        ))
                                    ) : data.recentBLs.length === 0 ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-xs italic">Aucune donnée récente.</td></tr>
                                    ) : (
                                        data.recentBLs.map(bl => (
                                            <tr key={bl.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-4 pl-2">
                                                    <span className="text-xs font-bold text-slate-900">{bl.numero}</span>
                                                    <p className="text-[9px] text-slate-400 font-medium">{new Date(bl.date_chargement).toLocaleDateString()}</p>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-700">{bl.lieu_chargement}</span>
                                                        <svg className="w-2.5 h-2.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                        <span className="text-[10px] font-bold text-slate-700">{bl.lieu_livraison}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 font-bold">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                                                        bl.statut === 'LIVRE' ? 'bg-emerald-50 text-emerald-600' : 
                                                        bl.statut === 'EN_COURS' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                        {bl.statut === 'LIVRE' ? 'Livré' : bl.statut === 'EN_COURS' ? 'En Cours' : 'Litige'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right pr-2 font-bold text-xs text-slate-900">
                                                    {(bl.montant || 0).toLocaleString()} <span className="text-slate-400 font-medium ml-1 text-[10px]">FCFA</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Right Action Column */}
                <div className="space-y-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Centre d'Opérations
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-3">
                        <Link href="/dashboard/bons-livraison" className="flex items-center justify-between p-4 bg-indigo-600 border border-indigo-700 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all group overflow-hidden relative">
                             <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                             <div className="flex items-center gap-4 relative z-10">
                                <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-bold text-white">Nouveau Bon</span>
                                    <span className="block text-[10px] text-indigo-100">Enregistrer un voyage</span>
                                </div>
                             </div>
                             <svg className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>

                        <Link href="/dashboard/depenses" className="flex items-center justify-between p-4 bg-white border border-soft-border rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-bold text-slate-800">Saisir Dépense</span>
                                    <span className="block text-[10px] text-slate-400">Sortie de caisse</span>
                                </div>
                             </div>
                             <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>

                        <Link href="/dashboard/rapports" className="flex items-center justify-between p-4 bg-white border border-soft-border rounded-2xl hover:border-amber-200 hover:shadow-md transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-bold text-slate-800">Rapports BI</span>
                                    <span className="block text-[10px] text-slate-400">Analyses avancées</span>
                                </div>
                             </div>
                             <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h4 className="text-sm font-bold mb-1">Aide & Support</h4>
                            <p className="text-[10px] text-slate-400 mb-4 font-medium italic opacity-80 leading-relaxed">
                                Un problème avec une affectation ou un BL ? Contactez le support technique.
                            </p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest">
                                Contactez-nous
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
