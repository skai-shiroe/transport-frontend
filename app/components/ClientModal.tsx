'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';

interface Client {
    id?: string;
    nom: string;
    adresse?: string;
    telephone?: string;
    email?: string;
}

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    client?: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSuccess, client }: ClientModalProps) {
    const [formData, setFormData] = useState<Client>({
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (client) {
                setFormData(client);
            } else {
                setFormData({
                    nom: '',
                    adresse: '',
                    telephone: '',
                    email: '',
                });
            }
            setError('');
        }
    }, [client, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (client?.id) {
                await api(`/clients/${client.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                await api('/clients', {
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
                                {client ? 'Modifier Client' : 'Nouveau Client'}
                            </h2>
                            <p className="text-sm text-secondary mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cobalt"></span>
                                {client ? 'Mettez à jour les coordonnées' : 'Enregistrez un nouveau partenaire'}
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
                            <div className="space-y-2.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nom / Raison Sociale</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="ex: GGC, SOBEBRA..."
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Adresse Siège</label>
                                <input
                                    type="text"
                                    className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground"
                                    value={formData.adresse}
                                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                    placeholder="Cotonou, Zone Industrielle..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground font-mono"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        placeholder="+229 00 00 00 00"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-brand-surface/40 border border-brand-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-cobalt/20 focus:border-brand-cobalt transition-all text-foreground"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="client@exemple.com"
                                    />
                                </div>
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
                                    {loading ? 'Enregistrement...' : client ? 'Mettre à jour le client' : 'Enregistrer le client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
