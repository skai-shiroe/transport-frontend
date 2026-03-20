'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import FactureModal from '@/app/components/FactureModal';
import InvoiceDetail from '@/app/components/InvoiceDetail';

/*
- [x] Period-based Invoice Generation
    - [x] Update Invoice Generation Modal with Date Pickers
    - [x] Update backend to filter delivery notes by date range
    - [x] Add filters to the Invoices list (Client, Date range)

- [/] Profit Reports Module
    - [ ] Backend: Create Report Controller and Routes
    - [ ] Frontend: Create Rapports page with Profit visualization
    - [ ] Frontend: Add Charts for monthly trends
    - [ ] Sidebar: Add link to Rapports
*/

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

const FilterBar = ({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    onClear
}: {
    startDate: string;
    endDate: string;
    onStartChange: (v: string) => void;
    onEndChange: (v: string) => void;
    onClear: () => void;
}) => (
    <div className="bg-white p-4 rounded-2xl border border-soft-border shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Période du</label>
            <input
                type="date"
                value={startDate}
                onChange={(e) => onStartChange(e.target.value)}
                className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700"
            />
        </div>
        <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">au</label>
            <input
                type="date"
                value={endDate}
                onChange={(e) => onEndChange(e.target.value)}
                className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700"
            />
        </div>
        {(startDate || endDate) && (
            <button
                onClick={onClear}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 ml-auto"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                Effacer les filtres
            </button>
        )}
    </div>
);

export default function FacturesPage() {
    const [factures, setFactures] = useState<Facture[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
    const [fullFacture, setFullFacture] = useState<any>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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

    const filteredFactures = React.useMemo(() => {
        return factures.filter(f => {
            if (!startDate && !endDate) return true;

            const d = new Date(f.date_emission).getTime();
            const start = startDate ? new Date(startDate).getTime() : -Infinity;
            const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime() : Infinity;

            return d >= start && d <= end;
        });
    }, [factures, startDate, endDate]);

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
            } catch (error: any) {
                if (error?.status === 403) return;
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

            <FilterBar
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                onClear={() => { setStartDate(''); setEndDate(''); }}
            />

            <DataTable
                data={filteredFactures}
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

