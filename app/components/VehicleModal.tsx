'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Vehicle {
    id?: string;
    immatriculation: string;
    marque: string;
    type: 'TRACTEUR' | 'REMORQUE' | 'PORTEUR';
    statut: 'DISPONIBLE' | 'EN_ROUTE' | 'EN_PANNE' | 'EN_MAINTENANCE';
}

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    vehicle?: Vehicle | null;
}

export default function VehicleModal({ isOpen, onClose, onSuccess, vehicle }: VehicleModalProps) {
    const [formData, setFormData] = useState<Vehicle>({
        immatriculation: '',
        marque: '',
        type: 'TRACTEUR',
        statut: 'DISPONIBLE'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (vehicle) {
                setFormData({
                    immatriculation: vehicle.immatriculation,
                    marque: vehicle.marque,
                    type: vehicle.type,
                    statut: vehicle.statut
                });
            } else {
                setFormData({
                    immatriculation: '',
                    marque: '',
                    type: 'TRACTEUR',
                    statut: 'DISPONIBLE'
                });
            }
            setError('');
        }
    }, [vehicle, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (vehicle?.id) {
                await api(`/vehicules/${vehicle.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                await api('/vehicules', {
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
            <div className="bg-white w-full max-w-lg rounded-2xl p-8 relative shadow-2xl border border-soft-border animate-slide-in">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">
                            {vehicle ? 'Modifier Véhicule' : 'Nouveau Véhicule'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Configurez les caractéristiques techniques du véhicule.</p>
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Immatriculation</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold uppercase"
                                value={formData.immatriculation}
                                onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                                placeholder="AB-123-CD"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marque</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.marque}
                                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                                placeholder="ex: Volvo"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type de Véhicule</label>
                        <select
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        >
                            <option value="TRACTEUR">TRACTEUR</option>
                            <option value="REMORQUE">REMORQUE</option>
                            <option value="PORTEUR">PORTEUR</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['DISPONIBLE', 'EN_ROUTE', 'EN_PANNE', 'EN_MAINTENANCE'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, statut: s as any })}
                                    className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${formData.statut === s
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                            : 'bg-white border-soft-border text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
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
                                vehicle ? 'Mettre à jour' : 'Enregistrer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
