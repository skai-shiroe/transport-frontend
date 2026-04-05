'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import ReportDetail from '@/app/components/ReportDetail';

interface ProfitReport {
    revenue: number;
    expenses: number;
    profit: number;
    expensesByCategory: Record<string, number>;
    period: { start: string; end: string };
}

type ClientName = string;

export default function ReportsPage() {
    const [report, setReport] = useState<ProfitReport | null>(null);
    const [clients, setClients] = useState<ClientName[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedClient, setSelectedClient] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Etat pour le modal de prévisualisation du rapport
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedClient) params.append('clientId', selectedClient);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const reportData = await api<ProfitReport>(`/reports/profit?${params.toString()}`);
            setReport(reportData);

            const clientsData = await api<ClientName[]>('/reports/clients');
            setClients(clientsData || []);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedClient, startDate, endDate]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
    };

    if (loading && !report) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in relative">
            
            {/* Version Écran */}
            <div className="space-y-8">
                {/* Header — même style que Dashboard */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
                            Rapports Financiers
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Analyse des bénéfices et performance de la société</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </header>

                {/* Barre de Filtres — soft-card style */}
                <div className="soft-card p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Client</label>
                        <select
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 transition-all text-slate-800 dark:text-slate-100 text-xs font-bold uppercase"
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                        >
                            <option value="">Tous les clients (Global)</option>
                            {clients.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 flex-[1.5]">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Période du</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 transition-all text-slate-800 dark:text-slate-100 text-xs font-bold"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Au</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl outline-none focus:border-indigo-400 transition-all text-slate-800 dark:text-slate-100 text-xs font-bold"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* KPI Cards — même style que StatCard du Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Revenus */}
                    <div className="soft-card p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/10"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Revenus (Facturé)</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {formatCurrency(report?.revenue || 0)}
                        </h3>
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                            <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10">↑</span>
                            <span>Rentabilité brute</span>
                        </div>
                    </div>

                    {/* Dépenses */}
                    <div className="soft-card p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-red-500/10"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Dépenses</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {formatCurrency(report?.expenses || 0)}
                        </h3>
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                            <span className="p-1 rounded-full bg-red-100 dark:bg-red-500/10">↓</span>
                            <span>Charges opérationnelles</span>
                        </div>
                    </div>

                    {/* Bénéfice Net */}
                    <div className={`soft-card p-8 relative overflow-hidden group scale-105 shadow-lg border ${report && report.profit >= 0 ? 'border-emerald-200 dark:border-emerald-500/20' : 'border-red-200 dark:border-red-500/20'}`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-all ${report && report.profit >= 0 ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' : 'bg-red-500/5 group-hover:bg-red-500/10'}`}></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Bénéfice Net</p>
                        <h3 className={`text-3xl font-display font-bold mb-2 ${report && report.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {formatCurrency(report?.profit || 0)}
                        </h3>
                        <div className={`flex items-center gap-2 text-xs font-bold ${report && report.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <span className={`p-1 rounded-full ${report && report.profit >= 0 ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
                                {report && report.profit >= 0 ? '✨' : '⚠️'}
                            </span>
                            <span>Marge sur la période</span>
                        </div>
                    </div>
                </div>

                {/* Détails */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Répartition des Dépenses */}
                    <div className="soft-card overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                            <h2 className="text-lg font-display font-semibold text-[#0f172a] dark:text-slate-100">Répartition des Dépenses</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {report && Object.entries(report.expensesByCategory).length > 0 ? (
                                Object.entries(report.expensesByCategory)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([label, value]) => {
                                        const percentage = ((value / report.expenses) * 100).toFixed(1);
                                        return (
                                            <div key={label} className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                                                    <span className="text-slate-800 dark:text-slate-100">{formatCurrency(value)} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <p className="text-sm text-slate-400 italic">Aucune dépense sur cette période.</p>
                            )}
                        </div>
                    </div>

                    {/* Analyse Flash */}
                    <div className="soft-card flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-2xl">📈</div>
                        <h2 className="text-lg font-display font-semibold text-black dark:text-slate-100">Analyse Flash</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                            {report && report.profit > 0
                                ? `Félicitations ! Vous avez généré un bénéfice de ${formatCurrency(report.profit)} ce mois-ci.`
                                : "Vos dépenses dépassent vos revenus sur cette période. Vérifiez les catégories de coûts les plus élevées."}
                        </p>
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 border border-indigo-700 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Aperçu / Imprimer le rapport
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Prévisualisation du Rapport */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-start justify-center overflow-y-auto p-4 md:p-12 animate-fade-in group">
                    <div className="relative w-full max-w-[210mm] animate-slide-in">
                        <button
                            onClick={() => setIsPreviewOpen(false)}
                            className="fixed right-8 top-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all print-hide z-50 backdrop-blur-xl"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <ReportDetail
                            report={report}
                            selectedClient={selectedClient}
                            startDate={startDate}
                            endDate={endDate}
                            onClose={() => setIsPreviewOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}