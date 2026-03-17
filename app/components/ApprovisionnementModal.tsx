'use client';

import React, { useState } from 'react';

interface ApprovisionnementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    caisseId: string;
    caisseNom: string;
    api: any;
}

export default function ApprovisionnementModal({ isOpen, onClose, onSave, caisseId, caisseNom, api }: ApprovisionnementModalProps) {
    const [formData, setFormData] = useState({
        montant: 0,
        description: '',
        caisseId: caisseId
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                montant: 0,
                description: '',
                caisseId: caisseId
            });
            setError('');
        }
    }, [isOpen, caisseId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.montant <= 0) {
            setError('Le montant doit être supérieur à 0');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api('/approvisionnements', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-emerald/5 blur-[80px] rounded-full"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-display font-black text-white tracking-tight">Approvisionnement</h2>
                        <p className="text-[10px] text-brand-emerald mt-1 uppercase font-black tracking-[0.2em]">Caisse: {caisseNom}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold mb-6 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Montant à ajouter (FCFA)</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl outline-none focus:border-brand-emerald/50 transition-all text-white font-black text-xl placeholder:text-gray-700"
                            value={formData.montant || ''}
                            onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description / Motif</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl outline-none focus:border-brand-emerald/50 transition-all text-white font-bold placeholder:text-gray-700"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="ex: Rechargement hebdomadaire..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-gray-500 hover:bg-white/5 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-brand-emerald hover:bg-brand-emerald/90 text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg shadow-brand-emerald/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px]"
                        >
                            {loading ? 'Traitement...' : 'Confirmer Rechargement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
