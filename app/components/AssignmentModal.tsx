'use client';

import React, { useState, useEffect } from 'react';
import api, { APIError } from '@/app/lib/api';

import { Assignment, AssignmentWithRelations } from '@/app/lib/types';

interface Option { id: string; label: string }

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    assignment?: Assignment | AssignmentWithRelations | null;
}

export default function AssignmentModal({ isOpen, onClose, onSuccess, assignment }: AssignmentModalProps) {
    const [formData, setFormData] = useState<Assignment>({
        vehicule_id: '',
        chauffeur_id: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: '',
        statut: 'EN_COURS',
        observations: ''
    });
    const [vehicules, setVehicules] = useState<Option[]>([]);
    const [chauffeurs, setChauffeurs] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vData, cData] = await Promise.all([
                    api<any[]>('/vehicules'),
                    api<any[]>('/chauffeurs')
                ]);
                setVehicules(vData.map(v => ({ id: v.id, label: `${v.immatriculation} (${v.marque})` })));
                setChauffeurs(cData.map(c => ({ id: c.id, label: `${c.nom} ${c.prenom}` })));
            } catch (err) {
                console.error('Failed to fetch assignment options:', err);
            }
        };
        if (isOpen) {
            fetchData();
            if (assignment) {
                setFormData({
                    vehicule_id: assignment.vehicule_id,
                    chauffeur_id: assignment.chauffeur_id,
                    date_debut: new Date(assignment.date_debut).toISOString().split('T')[0],
                    date_fin: assignment.date_fin ? new Date(assignment.date_fin).toISOString().split('T')[0] : '',
                    statut: assignment.statut,
                    observations: assignment.observations || ''
                });
            } else {
                setFormData({
                    vehicule_id: '',
                    chauffeur_id: '',
                    date_debut: new Date().toISOString().split('T')[0],
                    date_fin: '',
                    statut: 'EN_COURS',
                    observations: ''
                });
            }
            setError('');
        }
    }, [assignment, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (assignment?.id) {
                await api(`/affectations/${assignment.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                await api('/affectations', {
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
            <div className="bg-white w-full max-w-lg rounded-2xl p-8 relative shadow-2xl border border-soft-border animate-slide-in">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">
                            {assignment ? 'Modifier Affectation' : 'Nouvelle Affectation'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Liez un véhicule à un chauffeur.</p>
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
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Véhicule</label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={formData.vehicule_id}
                            onChange={(e) => setFormData({ ...formData, vehicule_id: e.target.value })}
                        >
                            <option value="">Sélectionner un véhicule</option>
                            {vehicules.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chauffeur</label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={formData.chauffeur_id}
                            onChange={(e) => setFormData({ ...formData, chauffeur_id: e.target.value })}
                        >
                            <option value="">Sélectionner un chauffeur</option>
                            {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date début</label>
                            <input
                                type="date" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.date_debut}
                                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date fin (optionnel)</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.date_fin || ''}
                                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                        <select
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={formData.statut}
                            onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                        >
                            <option value="EN_COURS">EN COURS</option>
                            <option value="TERMINE">TERMINE</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Observations</label>
                        <textarea
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium min-h-[60px] resize-none"
                            value={formData.observations || ''}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
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
                                assignment ? 'Mettre à jour' : 'Enregistrer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
