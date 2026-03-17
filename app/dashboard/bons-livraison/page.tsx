'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import BLModal from '@/app/components/BLModal';

export interface BL {
    id: string;
    numero: string;
    vehicule_id: string;
    produit_id: string;
    poids_depart: number;
    poids_arrive: number | null;
    prix_unitaire: number;
    perte: number;
    montant: number;
    lieu_chargement: string;
    lieu_livraison: string;
    date_chargement: string;
    date_livraison: string | null;
    statut: string;
    observations: string | null;
    vehicule: {
        immatriculation: string;
        affectations?: {
            chauffeur: { nom: string; prenom: string };
            statut: string;
        }[];
    };
    produit: { nom: string };
}

export default function BonsLivraisonPage() {
    const [bls, setBls] = useState<BL[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBL, setSelectedBL] = useState<BL | null>(null);

    const fetchBLs = async () => {
        setLoading(true);
        try {
            const data = await api<BL[]>('/bons-livraison');
            setBls(data);
        } catch (error) {
            console.error('Failed to fetch BLs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBLs();
    }, []);

    const handleAdd = () => {
        setSelectedBL(null);
        setIsModalOpen(true);
    };

    const handleEdit = (bl: BL) => {
        setSelectedBL(bl);
        setIsModalOpen(true);
    };

    const handleDelete = async (bl: BL) => {
        if (confirm(`Voulez-vous supprimer le bon de livraison n° ${bl.numero} ?`)) {
            try {
                await api(`/bons-livraison/${bl.id}`, { method: 'DELETE' });
                fetchBLs();
            } catch (error: any) {
                if (error?.status === 403) return;
                alert('Erreur lors de la suppression');
            }
        }
    };

    const columns = [
        {
            header: 'N° Bon / Trajet',
            accessor: (b: BL) => (
                <div>
                    <p className="font-bold text-slate-900">{b.numero}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{b.lieu_chargement} → {b.lieu_livraison}</p>
                </div>
            )
        },
        {
            header: 'Véhicule & Chauffeur',
            accessor: (b: BL) => {
                const activeAffectation = b.vehicule?.affectations?.find(a => a.statut === 'EN_COURS');
                return (
                    <div>
                        <p className="text-xs font-bold text-slate-700">{b.vehicule?.immatriculation}</p>
                        <p className="text-[10px] text-slate-400">
                            {activeAffectation ? `${activeAffectation.chauffeur.nom} ${activeAffectation.chauffeur.prenom}` : 'Aucun chauffeur'}
                        </p>
                    </div>
                );
            }
        },
        {
            header: 'Produit & Poids',
            accessor: (b: BL) => (
                <div>
                    <p className="text-xs font-medium text-slate-700">{b.produit?.nom}</p>
                    <p className="text-[10px] text-indigo-600 font-bold">
                        {(b.poids_depart || 0).toLocaleString()} <span className="text-slate-400 font-normal">T (Dép)</span> / {(b.poids_arrive || 0).toLocaleString()} <span className="text-slate-400 font-normal">T (Arr)</span>
                    </p>
                </div>
            )
        },
        {
            header: 'Montant',
            accessor: (b: BL) => (
                <span className="font-mono font-bold text-slate-900">
                    {(b.montant || 0).toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">FCFA</span>
                </span>
            )
        },
        {
            header: 'Statut',
            accessor: (b: BL) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.statut === 'LIVRE' ? 'bg-emerald-50 text-emerald-600' : 
                    b.statut === 'EN_COURS' ? 'bg-indigo-50 text-indigo-600' : 
                    'bg-amber-50 text-amber-600'
                }`}>
                    {b.statut}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Bons de Livraison</h1>
                    <p className="text-slate-500 text-sm">Suivi des chargements et des livraisons en temps réel.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau Bon
                </button>
            </header>

            <DataTable 
                data={bls} 
                columns={columns} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <BLModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchBLs} 
                bl={selectedBL} 
            />
        </div>
    );
}
