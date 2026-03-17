'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Breakdown {
    id?: string;
    description: string;
    vehiculeId: string;
    technicienId?: string;
    statut?: 'SIGNALEE' | 'EN_REPARATION' | 'REPAREE';
    dateSignalement?: string;
    dateReparation?: string;
}

interface Vehicle { id: string; plaque: string; }
interface Technician { id: string; nom: string; }

interface BreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    breakdown?: Breakdown | null;
}

export default function BreakdownModal({ isOpen, onClose, onSuccess, breakdown }: BreakdownModalProps) {
    const [formData, setFormData] = useState<Breakdown>({
        description: '',
        vehiculeId: '',
        technicienId: '',
        statut: 'SIGNALEE',
        dateSignalement: new Date().toISOString().split('T')[0],
    });
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [vData, tData] = await Promise.all([
                        api<Vehicle[]>('/vehicles'),
                        api<Technician[]>('/technicians')
                    ]);
                    setVehicles(vData);
                    setTechnicians(tData);
                } catch (err) {
                    console.error('Failed to fetch dependencies:', err);
                }
            };
            fetchData();

            if (breakdown) {
                setFormData({
                    ...breakdown,
                    dateSignalement: breakdown.dateSignalement ? new Date(breakdown.dateSignalement).toISOString().split('T')[0] : '',
                    dateReparation: breakdown.dateReparation ? new Date(breakdown.dateReparation).toISOString().split('T')[0] : '',
                });
            } else {
                setFormData({
                    description: '',
                    vehiculeId: '',
                    technicienId: '',
                    statut: 'SIGNALEE',
                    dateSignalement: new Date().toISOString().split('T')[0],
                });
            }
            setError('');
        }
    }, [breakdown, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                dateSignalement: new Date(formData.dateSignalement!).toISOString(),
                dateReparation: formData.dateReparation ? new Date(formData.dateReparation).toISOString() : undefined,
            };

            if (breakdown?.id) {
                await api(`/breakdowns/${breakdown.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                await api('/breakdowns', {
                    method: 'POST',
                    body: JSON.stringify(payload),
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="glass w-full max-w-lg rounded-2xl p-8 relative shadow-2xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-display text-gradient">
                                {breakdown ? 'Gérer la Panne' : 'Nouvelle Panne'}
                            </h2>
                            <p className="text-sm text-secondary mt-1">
                                {breakdown ? 'Mettez à jour le suivi technique' : 'Signalez un problème technique'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6 animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary ml-1">Description du Problème</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full bg-brand-surface/50 border border-brand-border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez le problème constaté..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary ml-1">Véhicule</label>
                                <select
                                    required
                                    className="w-full bg-brand-surface/50 border border-brand-border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                    value={formData.vehiculeId}
                                    onChange={(e) => setFormData({ ...formData, vehiculeId: e.target.value })}
                                >
                                    <option value="">Sélectionner un véhicule</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary ml-1">Technicien (Optionnel)</label>
                                <select
                                    className="w-full bg-brand-surface/50 border border-brand-border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                    value={formData.technicienId}
                                    onChange={(e) => setFormData({ ...formData, technicienId: e.target.value })}
                                >
                                    <option value="">Assigner plus tard</option>
                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary ml-1">Statut</label>
                                <select
                                    className="w-full bg-brand-surface/50 border border-brand-border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                    value={formData.statut}
                                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                                >
                                    <option value="SIGNALEE">SIGNALÉE</option>
                                    <option value="EN_REPARATION">EN RÉPARATION</option>
                                    <option value="REPAREE">RÉPARÉE</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-brand-border text-secondary hover:bg-brand-surface transition-all font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-brand-cobalt hover:bg-brand-cobalt/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-brand-cobalt/20 active:scale-95"
                                >
                                    {loading ? 'Traitement...' : breakdown ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
