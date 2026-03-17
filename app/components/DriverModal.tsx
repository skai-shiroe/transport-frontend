'use client';

import React, { useState, useEffect } from 'react';
import api, { APIError } from '@/app/lib/api';

import { Driver } from '@/app/lib/types';

interface DriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    driver?: Driver | null;
}

export default function DriverModal({ isOpen, onClose, onSuccess, driver }: DriverModalProps) {
    const [formData, setFormData] = useState<Driver>({
        nom: '',
        prenom: '',
        telephone_1: '',
        telephone_2: '',
        numero_permis: '',
        date_expiration_permis: '',
        nationalite: 'Togolaise',
        statut: 'ACTIF',
        date_embauche: new Date().toISOString().split('T')[0],
        observations: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (driver) {
                setFormData({
                    ...driver,
                    date_expiration_permis: driver.date_expiration_permis ? new Date(driver.date_expiration_permis).toISOString().split('T')[0] : '',
                    date_embauche: driver.date_embauche ? new Date(driver.date_embauche).toISOString().split('T')[0] : '',
                    telephone_2: driver.telephone_2 || '',
                    observations: driver.observations || ''
                });
            } else {
                setFormData({
                    nom: '',
                    prenom: '',
                    telephone_1: '',
                    telephone_2: '',
                    numero_permis: '',
                    date_expiration_permis: '',
                    nationalite: 'Togolaise',
                    statut: 'ACTIF',
                    date_embauche: new Date().toISOString().split('T')[0],
                    observations: ''
                });
            }
            setError('');
        }
    }, [driver, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (driver?.id) {
                await api(`/chauffeurs/${driver.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                await api('/chauffeurs', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err?.status === 403) {
                onClose();
                return;
            }
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
                            {driver ? 'Modifier Chauffeur' : 'Nouveau Chauffeur'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Gérez le profil et les documents du conducteur.</p>
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.prenom}
                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Téléphone 1</label>
                            <input
                                type="tel" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.telephone_1}
                                onChange={(e) => setFormData({ ...formData, telephone_1: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Téléphone 2 (Optionnel)</label>
                            <input
                                type="tel"
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.telephone_2 || ''}
                                onChange={(e) => setFormData({ ...formData, telephone_2: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">N° Permis</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium uppercase"
                                value={formData.numero_permis}
                                onChange={(e) => setFormData({ ...formData, numero_permis: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiration Permis</label>
                            <input
                                type="date" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.date_expiration_permis}
                                onChange={(e) => setFormData({ ...formData, date_expiration_permis: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nationalité</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.nationalite}
                                onChange={(e) => setFormData({ ...formData, nationalite: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                            <select
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                value={formData.statut}
                                onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                            >
                                <option value="ACTIF">ACTIF</option>
                                <option value="INACTIF">INACTIF</option>
                                <option value="SUSPENDU">SUSPENDU</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Observations</label>
                        <textarea
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium min-h-[60px] resize-none"
                            value={formData.observations || ''}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            placeholder="Remarques éventuelles..."
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
                                driver ? 'Mettre à jour' : 'Enregistrer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
