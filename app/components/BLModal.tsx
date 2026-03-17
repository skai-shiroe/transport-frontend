'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface BLData {
    id?: string;
    numero: string;
    vehicule_id: string;
    produit_id: string;
    poids_depart: number;
    poids_arrive: number;
    prix_unitaire: number;
    lieu_chargement: string;
    lieu_livraison: string;
    date_chargement: string;
    date_livraison: string;
    statut: string;
    observations: string;
}

interface Option { id: string; label: string; defaultPrice?: number }

interface BLModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    bl?: any | null; // Using any for input since it might have the old structure or new
}

export default function BLModal({ isOpen, onClose, onSuccess, bl }: BLModalProps) {
    const [formData, setFormData] = useState<BLData>({
        numero: '',
        vehicule_id: '',
        produit_id: '',
        poids_depart: 0,
        poids_arrive: 0,
        prix_unitaire: 0,
        lieu_chargement: 'Lomé',
        lieu_livraison: 'Ouagadougou',
        date_chargement: new Date().toISOString().split('T')[0],
        date_livraison: '',
        statut: 'EN_COURS',
        observations: ''
    });
    
    const [vehicules, setVehicules] = useState<Option[]>([]);
    const [produits, setProduits] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vData, pData] = await Promise.all([
                    api<any[]>('/vehicules'),
                    api<any[]>('/produits')
                ]);
                // We show all vehicles, but maybe only those with active assignments make sense?
                // The backend checks for active assignment status.
                setVehicules(vData.map(v => ({ 
                    id: v.id, 
                    label: `${v.immatriculation} (${v.statut})` 
                })));
                setProduits(pData.map(p => ({ 
                    id: p.id, 
                    label: p.nom,
                    defaultPrice: p.prix_unitaire_defaut
                })));
            } catch (err) {
                console.error('Failed to fetch BL options:', err);
            }
        };
        if (isOpen) {
            fetchData();
            if (bl) {
                setFormData({
                    numero: bl.numero || bl.numero_bl || '',
                    vehicule_id: bl.vehicule_id || bl.affectation?.vehicule_id || '',
                    produit_id: bl.produit_id || '',
                    poids_depart: bl.poids_depart || bl.quantite || 0,
                    poids_arrive: bl.poids_arrive || 0,
                    prix_unitaire: bl.prix_unitaire || 0,
                    lieu_chargement: bl.lieu_chargement || 'Lomé',
                    lieu_livraison: bl.lieu_livraison || 'Ouagadougou',
                    date_chargement: bl.date_chargement ? new Date(bl.date_chargement).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    date_livraison: bl.date_livraison ? new Date(bl.date_livraison).toISOString().split('T')[0] : '',
                    statut: bl.statut || 'EN_COURS',
                    observations: bl.observations || ''
                });
            } else {
                setFormData({
                    numero: '',
                    vehicule_id: '',
                    produit_id: '',
                    poids_depart: 0,
                    poids_arrive: 0,
                    prix_unitaire: 0,
                    lieu_chargement: 'Lomé',
                    lieu_livraison: 'Ouagadougou',
                    date_chargement: new Date().toISOString().split('T')[0],
                    date_livraison: '',
                    statut: 'EN_COURS',
                    observations: ''
                });
            }
            setError('');
        }
    }, [bl, isOpen]);

    const handleProductChange = (id: string) => {
        const prod = produits.find(p => p.id === id);
        setFormData(prev => ({ 
            ...prev, 
            produit_id: id, 
            prix_unitaire: prod?.defaultPrice || 0 
        }));
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const submissionData = { ...formData };
        if (!submissionData.date_livraison) delete (submissionData as any).date_livraison;

        try {
            if (bl?.id) {
                await api(`/bons-livraison/${bl.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(submissionData),
                });
            } else {
                await api('/bons-livraison', {
                    method: 'POST',
                    body: JSON.stringify(submissionData),
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl border border-soft-border animate-slide-in max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">
                            {bl ? 'Modifier Bon de Livraison' : 'Nouveau Bon de Livraison'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Enregistrez les détails du transport.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">N° Bon</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                                value={formData.numero}
                                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                placeholder="BL-2024-XXX"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Véhicule</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                value={formData.vehicule_id}
                                onChange={(e) => setFormData({ ...formData, vehicule_id: e.target.value })}
                            >
                                <option value="">Choisir un véhicule</option>
                                {vehicules.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Produit</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                value={formData.produit_id}
                                onChange={(e) => handleProductChange(e.target.value)}
                            >
                                <option value="">Choisir un produit</option>
                                {produits.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Chargement</label>
                            <input
                                type="date" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.date_chargement}
                                onChange={(e) => setFormData({ ...formData, date_chargement: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Poids Départ (T)</label>
                            <input
                                type="number" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                                value={formData.poids_depart}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setFormData({ ...formData, poids_depart: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Poids Arrivée (T)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                                value={formData.poids_arrive}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setFormData({ ...formData, poids_arrive: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prix Unitaire</label>
                            <input
                                type="number" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                                value={formData.prix_unitaire}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setFormData({ ...formData, prix_unitaire: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                value={formData.statut}
                                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                            >
                                <option value="EN_COURS">EN COURS</option>
                                <option value="LIVRE">LIVRÉ</option>
                                <option value="LITIGIEUX">LITIGIEUX</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Livraison</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.date_livraison}
                                onChange={(e) => setFormData({ ...formData, date_livraison: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lieu Chargement</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.lieu_chargement}
                                onChange={(e) => setFormData({ ...formData, lieu_chargement: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lieu Livraison</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.lieu_livraison}
                                onChange={(e) => setFormData({ ...formData, lieu_livraison: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Observations</label>
                        <textarea
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium h-20 resize-none"
                            value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            placeholder="Détails supplémentaires..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-soft-border text-slate-500 hover:bg-slate-50 transition-all font-bold text-xs"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] text-xs flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                bl ? 'Mettre à jour' : 'Enregistrer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
