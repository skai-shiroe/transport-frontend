'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Product { id: string; nom: string; }
interface Trip { id: string; depart: string; destination: string; }

interface DeliveryNote {
    id?: string;
    numero?: string;
    poidsDepart: number;
    poidsArrivee?: number;
    poidsDecharge?: number;
    observation?: string;
    voyageId: string;
    produitId: string;
}

interface DeliveryNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    deliveryNote?: DeliveryNote | null;
    initialVoyageId?: string;
}

export default function DeliveryNoteModal({ isOpen, onClose, onSuccess, deliveryNote, initialVoyageId }: DeliveryNoteModalProps) {
    const [formData, setFormData] = useState<DeliveryNote>({
        poidsDepart: 0,
        poidsArrivee: undefined,
        poidsDecharge: 0,
        observation: '',
        voyageId: initialVoyageId || '',
        produitId: '',
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [pData, tData] = await Promise.all([
                        api<Product[]>('/products'),
                        api<Trip[]>('/journeys')
                    ]);
                    setProducts(pData);
                    setTrips(tData);
                } catch (err) {
                    console.error('Failed to fetch dependencies:', err);
                }
            };
            fetchData();

            if (deliveryNote) {
                setFormData({
                    ...deliveryNote,
                    poidsArrivee: deliveryNote.poidsArrivee ?? undefined,
                    poidsDecharge: deliveryNote.poidsDecharge ?? 0,
                });
            } else {
                setFormData({
                    poidsDepart: 0,
                    poidsArrivee: undefined,
                    poidsDecharge: 0,
                    observation: '',
                    voyageId: initialVoyageId || '',
                    produitId: '',
                });
            }
            setError('');
        }
    }, [deliveryNote, isOpen, initialVoyageId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (deliveryNote?.id) {
                await api(`/delivery-notes/${deliveryNote.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                await api('/delivery-notes', {
                    method: 'POST',
                    body: JSON.stringify(formData),
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="glass w-full max-w-2xl rounded-3xl p-8 md:p-10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-gradient">
                                {deliveryNote ? 'Modifier Bon de Livraison' : 'Nouveau Bon de Livraison'}
                            </h2>
                            <p className="text-sm text-secondary mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cobalt"></span>
                                {deliveryNote ? `BL N° ${deliveryNote.numero}` : 'Détails du chargement pour le voyage'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-all p-2.5 hover:bg-white/5 rounded-full">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-8 animate-shake flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Voyage Trajet</label>
                                    <div className="relative">
                                        <select
                                            required
                                            disabled={!!initialVoyageId}
                                            className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            value={formData.voyageId}
                                            onChange={(e) => setFormData({ ...formData, voyageId: e.target.value })}
                                        >
                                            <option value="">Sélectionner un voyage</option>
                                            {trips.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.depart} → {t.destination}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Type de Produit</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                            value={formData.produitId}
                                            onChange={(e) => setFormData({ ...formData, produitId: e.target.value })}
                                        >
                                            <option value="">Sélectionner un produit</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.nom}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 text-blue-400">Poids Départ (T)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground font-mono text-lg"
                                        value={formData.poidsDepart}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, poidsDepart: isNaN(val) ? 0 : val });
                                        }}
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 text-emerald-400">Poids Arrivée (T)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground font-mono text-lg"
                                        value={formData.poidsArrivee ?? ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, poidsArrivee: isNaN(val) ? 0 : val });
                                        }}
                                        placeholder="N/A"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 text-orange-400">Décharge (T)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground font-mono text-lg"
                                        value={formData.poidsDecharge}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, poidsDecharge: isNaN(val) ? 0 : val });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-500">Observations / Remarques</label>
                                <textarea
                                    className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground min-h-[120px] resize-none"
                                    value={formData.observation}
                                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                                    placeholder="Indiquez toute anomalie ou détail pertinent ici..."
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-8 py-4 rounded-2xl border border-brand-border text-secondary hover:bg-white/5 transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-brand-cobalt hover:bg-brand-cobalt/90 text-white font-black px-8 py-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-brand-cobalt/25 active:scale-[0.98] uppercase tracking-widest text-xs"
                                >
                                    {loading ? 'Transmission...' : deliveryNote ? 'Mettre à jour le BL' : 'Enregistrer le BL'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
