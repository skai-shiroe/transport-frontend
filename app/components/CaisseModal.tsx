'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Caisse {
    id?: string;
    montant_initial: number;
    periode: string;
    notes: string;
}

interface CaisseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    caisse?: Caisse | null;
}

export default function CaisseModal({ isOpen, onClose, onSuccess, caisse }: CaisseModalProps) {
    const [formData, setFormData] = useState<Caisse>({
        montant_initial: 0,
        periode: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (caisse) {
                setFormData({
                    montant_initial: caisse.montant_initial,
                    periode: caisse.periode,
                    notes: caisse.notes || ''
                });
            } else {
                setFormData({
                    montant_initial: 0,
                    periode: '',
                    notes: ''
                });
            }
            setError('');
        }
    }, [caisse, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (caisse?.id) {
                await api(`/caisses/${caisse.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                await api('/caisses', {
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
        <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-8 relative shadow-2xl border border-soft-border animate-slide-in">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">
                            {caisse ? 'Détails de la Caisse' : 'Initialiser une Caisse'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Définissez le budget pour une nouvelle période.</p>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Période (Mois / Nom)</label>
                        <input
                            type="text" required
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                            value={formData.periode}
                            onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                            placeholder="ex: Mars 2024"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Montant Initial (FCFA)</label>
                        <input
                            type="number" required
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                            value={formData.montant_initial}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setFormData({ ...formData, montant_initial: isNaN(val) ? 0 : val });
                            }}
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes / Observations</label>
                        <textarea
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium min-h-[100px] resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Précisez l'usage prévu pour ces fonds..."
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
                                caisse ? 'Mettre à jour' : 'Initialiser la Caisse'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
