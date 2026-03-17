'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import FactureModal from '@/app/components/FactureModal';
import InvoiceDetail from '@/app/components/InvoiceDetail';

interface Facture {
    id: string;
    numero: string;
    emetteur: string;
    client: string;
    trajet_description: string;
    date_emission: string;
    total_poids: number;
    total_montant: number;
    statut: 'BROUILLON' | 'EMISE' | 'PAYEE';
}

export default function FacturesPage() {
    const [factures, setFactures] = useState<Facture[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
    const [fullFacture, setFullFacture] = useState<any>(null);

    const fetchFactures = async () => {
        setLoading(true);
        try {
            const data = await api<Facture[]>('/factures');
            setFactures(data);
        } catch (error) {
            console.error('Failed to fetch factures:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFactures();
    }, []);

    const handleAdd = () => {
        setSelectedFacture(null);
        setIsModalOpen(true);
    };

    const handleEdit = (facture: Facture) => {
        setSelectedFacture(facture);
        setIsModalOpen(true);
    };

    const handleView = async (facture: Facture) => {
        try {
            const fullData = await api<any>(`/factures/${facture.id}`);
            setFullFacture(fullData);
            setIsPreviewOpen(true);
        } catch (error) {
            alert('Erreur lors de la récupération des détails');
        }
    };

    const handleDelete = async (facture: Facture) => {
        if (confirm(`Supprimer la facture ${facture.numero} ?`)) {
            try {
                await api(`/factures/${facture.id}`, { method: 'DELETE' });
                fetchFactures();
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const columns = [
        {
            header: 'N° Facture',
            accessor: (f: Facture) => (
                <span className="font-mono font-bold text-indigo-600">{f.numero}</span>
            )
        },
        { header: 'Client', accessor: (f: Facture) => f.client },
        { 
            header: 'Date Emission', 
            accessor: (f: Facture) => new Date(f.date_emission).toLocaleDateString() 
        },
        { 
            header: 'Montant TTC', 
            accessor: (f: Facture) => (
                <span className="font-bold text-slate-900">
                    {(f.total_montant || 0).toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span>
                </span>
            ) 
        },
        {
            header: 'Statut',
            accessor: (f: Facture) => {
                const colors: Record<string, string> = {
                    'BROUILLON': 'bg-slate-100 text-slate-500',
                    'EMISE': 'bg-blue-50 text-blue-600',
                    'PAYEE': 'bg-emerald-50 text-emerald-600'
                };
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[f.statut] || 'bg-slate-100 text-slate-500'}`}>
                        {f.statut}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            accessor: (f: Facture) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleView(f)}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-500 rounded-lg transition-colors"
                        title="Visualiser / Imprimer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button 
                        onClick={() => handleEdit(f)}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                        onClick={() => handleDelete(f)}
                        className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Facturation</h1>
                    <p className="text-slate-500 text-sm">Gérez vos factures et bordereaux d'expédition.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle facture
                </button>
            </header>

            <DataTable 
                data={factures} 
                columns={columns} 
                loading={loading}
                hideDefaultActions={true}
            />

            <FactureModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchFactures} 
                facture={selectedFacture} 
            />

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-start justify-center overflow-y-auto p-4 md:p-12 animate-fade-in group print:p-0">
                    <div className="relative w-full max-w-[210mm] animate-slide-in">
                        <button 
                            onClick={() => setIsPreviewOpen(false)}
                            className="fixed right-8 top-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all print-hide z-50 backdrop-blur-xl"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        <InvoiceDetail 
                            facture={fullFacture} 
                            onClose={() => setIsPreviewOpen(false)} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

