'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Trip {
    id?: string;
    depart: string;
    destination: string;
    dateDepart: string;
    dateArrivee?: string;
    vehiculeId: string;
    chauffeurId: string;
    clientId?: string;
    statut?: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
    bons?: any[];
}

interface Vehicle { id: string; plaque: string; }
interface Driver { id: string; nom: string; }
interface Client { id: string; nom: string; }

interface TripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    trip?: Trip | null;
}

export default function TripModal({ isOpen, onClose, onSuccess, trip }: TripModalProps) {
    const [formData, setFormData] = useState<Trip>({
        depart: '',
        destination: '',
        dateDepart: new Date().toISOString().split('T')[0],
        dateArrivee: '',
        vehiculeId: '',
        chauffeurId: '',
        clientId: '',
        statut: 'PLANIFIE',
    });
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [vData, dData, cData] = await Promise.all([
                        api<Vehicle[]>('/vehicles'),
                        api<Driver[]>('/drivers'),
                        api<Client[]>('/clients')
                    ]);
                    setVehicles(vData);
                    setDrivers(dData);
                    setClients(cData);
                } catch (err) {
                    console.error('Failed to fetch dependencies:', err);
                }
            };
            fetchData();

            if (trip) {
                setFormData({
                    ...trip,
                    dateDepart: trip.dateDepart ? new Date(trip.dateDepart).toISOString().split('T')[0] : '',
                    dateArrivee: trip.dateArrivee ? new Date(trip.dateArrivee).toISOString().split('T')[0] : '',
                });
            } else {
                setFormData({
                    depart: '',
                    destination: '',
                    dateDepart: new Date().toISOString().split('T')[0],
                    dateArrivee: '',
                    vehiculeId: '',
                    chauffeurId: '',
                    statut: 'PLANIFIE',
                });
            }
            setError('');
        }
    }, [trip, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                dateDepart: new Date(formData.dateDepart).toISOString(),
                dateArrivee: formData.dateArrivee ? new Date(formData.dateArrivee).toISOString() : undefined,
            };

            if (trip?.id) {
                await api(`/journeys/${trip.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                await api('/journeys', {
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="glass w-full max-w-4xl rounded-3xl p-8 md:p-12 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 my-4 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-gradient">
                                {trip ? 'Modifier Voyage' : 'Nouveau Voyage'}
                            </h2>
                            <p className="text-sm text-secondary mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cobalt animate-pulse"></span>
                                {trip ? 'Mettez à jour les détails du trajet' : 'Planifiez un nouveau trajet'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-all p-2.5 hover:bg-white/5 rounded-full outline-none">
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
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Itinéraire</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground"
                                            value={formData.depart}
                                            onChange={(e) => setFormData({ ...formData, depart: e.target.value })}
                                            placeholder="Départ (ex: Cotonou)"
                                        />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground"
                                            value={formData.destination}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            placeholder="Arrivée (ex: Parakou)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Calendrier</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none"
                                                value={formData.dateDepart}
                                                onChange={(e) => setFormData({ ...formData, dateDepart: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none"
                                                value={formData.dateArrivee}
                                                onChange={(e) => setFormData({ ...formData, dateArrivee: e.target.value })}
                                                placeholder="Arrivée prévue"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Affectations</label>
                                        <select
                                            required
                                            className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                            value={formData.vehiculeId}
                                            onChange={(e) => setFormData({ ...formData, vehiculeId: e.target.value })}
                                        >
                                            <option value="">Sélectionner un véhicule</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
                                        </select>
                                    </div>
                                    <select
                                        required
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                        value={formData.chauffeurId}
                                        onChange={(e) => setFormData({ ...formData, chauffeurId: e.target.value })}
                                    >
                                        <option value="">Sélectionner un chauffeur</option>
                                        {drivers.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Client Partenaire</label>
                                    <select
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer"
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    >
                                        <option value="">Aucun client (Indépendant)</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Statut Opérationnel</label>
                                    <select
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground appearance-none cursor-pointer font-bold"
                                        value={formData.statut}
                                        onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                                    >
                                        <option value="PLANIFIE">🕒 PLANIFIÉ</option>
                                        <option value="EN_COURS">🚚 EN COURS</option>
                                        <option value="TERMINE">✅ TERMINÉ</option>
                                        <option value="ANNULE">❌ ANNULÉ</option>
                                    </select>
                                </div>

                                {trip?.id && (
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bons de Livraison</label>
                                            <button
                                                type="button"
                                                className="text-[10px] font-black uppercase tracking-widest bg-brand-cobalt hover:bg-brand-cobalt/90 text-white px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('open-bl-modal', { detail: { voyageId: trip.id } }));
                                                }}
                                            >
                                                + BL
                                            </button>
                                        </div>
                                        <div className="bg-black/20 border border-white/5 rounded-2xl p-4 min-h-[100px] max-h-[160px] overflow-y-auto space-y-2 scrollbar-hide">
                                            {trip.bons && trip.bons.length > 0 ? (
                                                trip.bons.map((bon: any) => (
                                                    <div key={bon.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-brand-cobalt/30 transition-all">
                                                        <div>
                                                            <p className="text-[10px] font-mono text-brand-cobalt"># {bon.numero}</p>
                                                            <p className="text-[11px] font-bold text-gray-300">{(bon as any).produit?.nom || 'Produit'}</p>
                                                        </div>
                                                        <span className="text-[10px] font-black text-secondary">
                                                            {bon.poidsDepart}T → {bon.poidsArrivee ?? '?'}T
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-30 py-4">
                                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    <p className="text-[10px] uppercase font-black">Aucun document</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 pt-8">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-8 py-4 rounded-2xl border border-brand-border text-secondary hover:bg-white/5 transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    Abandonner
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-brand-cobalt hover:bg-brand-cobalt/90 text-white font-black px-8 py-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-brand-cobalt/25 active:scale-[0.98] uppercase tracking-widest text-xs"
                                >
                                    {loading ? 'Transmission...' : trip ? 'Mettre à jour le voyage' : 'Lancer le voyage'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
