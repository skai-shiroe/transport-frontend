'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Technician {
    id?: string;
    nom: string;
    type: 'MECANICIEN' | 'ELECTRONICIEN';
    telephone?: string;
}

interface TechnicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    technician?: Technician | null;
}

export default function TechnicianModal({ isOpen, onClose, onSuccess, technician }: TechnicianModalProps) {
    const [formData, setFormData] = useState<Technician>({
        nom: '',
        type: 'MECANICIEN',
        telephone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (technician) {
                setFormData(technician);
            } else {
                setFormData({
                    nom: '',
                    type: 'MECANICIEN',
                    telephone: '',
                });
            }
            setError('');
        }
    }, [technician, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (technician?.id) {
                await api(`/technicians/${technician.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                await api('/technicians', {
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="glass w-full max-w-lg rounded-2xl p-8 relative shadow-2xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-display text-gradient">
                                {technician ? 'Modifier Technicien' : 'Nouveau Technicien'}
                            </h2>
                            <p className="text-sm text-secondary mt-1">
                                {technician ? 'Mettez à jour les informations' : 'Enregistrez un nouvel agent technique'}
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
                                <label className="text-sm font-medium text-secondary ml-1">Nom Complet</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-brand-surface/50 border border-brand-border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="Jean Tech"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary ml-1">Spécialité</label>
                                <select
                                    className="w-full bg-brand-surface/50 border border-brand-border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="MECANICIEN">MÉCANICIEN</option>
                                    <option value="ELECTRONICIEN">ÉLECTRONICIEN</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary ml-1">Téléphone</label>
                                <input
                                    type="text"
                                    className="w-full bg-brand-surface/50 border border-brand-border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground"
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    placeholder="+229 90 00 00 00"
                                />
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
                                    {loading ? 'Traitement...' : technician ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
