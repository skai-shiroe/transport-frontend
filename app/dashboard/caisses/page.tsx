'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import CaisseModal from '@/app/components/CaisseModal';

interface Caisse {
    id: string;
    montant_initial: number;
    montant_total_charge: number;
    reste: number;
    periode: string;
    date_creation: string;
    notes: string;
}

export default function CaissesPage() {
    const [caisses, setCaisses] = useState<Caisse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCaisse, setSelectedCaisse] = useState<Caisse | null>(null);

    const fetchCaisses = async () => {
        setLoading(true);
        try {
            const data = await api<Caisse[]>('/caisses');
            setCaisses(data);
        } catch (error) {
            console.error('Failed to fetch caisses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaisses();
    }, []);

    const handleAdd = () => {
        setSelectedCaisse(null);
        setIsModalOpen(true);
    };

    const handleEdit = (caisse: Caisse) => {
        setSelectedCaisse(caisse);
        setIsModalOpen(true);
    };

    const handleDelete = async (caisse: Caisse) => {
        if (confirm(`Supprimer la caisse de la période "${caisse.periode}" ?`)) {
            try {
                await api(`/caisses/${caisse.id}`, { method: 'DELETE' });
                fetchCaisses();
            } catch (error: any) {
                if (error?.status === 403) return;
                alert('Erreur lors de la suppression');
            }
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Gestion des Caisses</h1>
                    <p className="text-slate-500 text-sm">Suivi des budgets et des périodes financières.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle Période / Caisse
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-50 border border-soft-border rounded-2xl h-48 animate-pulse"></div>
                    ))
                ) : caisses.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Aucune caisse enregistrée</p>
                    </div>
                ) : (
                    caisses.map((caisse) => (
                        <div key={caisse.id} className="soft-card p-6 bg-white border border-soft-border rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{caisse.periode}</h3>
                                    <p className="text-2xl font-black text-slate-900 mt-1">
                                        {caisse.reste.toLocaleString()} <span className="text-xs text-slate-400">FCFA</span>
                                    </p>
                                </div>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Montant Initial</span>
                                    <span className="font-bold text-slate-700">{caisse.montant_initial.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Total Dépenses</span>
                                    <span className="font-bold text-rose-500">-{caisse.montant_total_charge.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div 
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (caisse.reste / caisse.montant_initial) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(caisse)}
                                    className="flex-1 px-3 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Détails
                                </button>
                                <button
                                    onClick={() => handleDelete(caisse)}
                                    className="px-3 py-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CaisseModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchCaisses} 
                caisse={selectedCaisse} 
            />
        </div>
    );
}
