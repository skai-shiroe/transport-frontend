'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import NotificationAlertModal from './NotificationAlertModal';

interface Expense {
    id?: string;
    date: string;
    vehicule_id?: string;
    chauffeur_id?: string;
    utilisateur_id?: string;
    designation: string;
    montant: number;
    caisse_id: string;
    client?: string;
}

interface Option { id: string; label: string }

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense?: Expense | null;
}

export default function ExpenseModal({ isOpen, onClose, onSuccess, expense }: ExpenseModalProps) {
    const [formData, setFormData] = useState<Expense>({
        date: new Date().toISOString().split('T')[0],
        vehicule_id: '',
        chauffeur_id: '',
        designation: '',
        montant: 0,
        caisse_id: '',
        client: 'Général'
    });

    const [vehicules, setVehicules] = useState<Option[]>([]);
    const [chauffeurs, setChauffeurs] = useState<Option[]>([]);
    const [utilisateurs, setUtilisateurs] = useState<Option[]>([]);
    const [caisses, setCaisses] = useState<Option[]>([]);
    const [clientNames, setClientNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [alertData, setAlertData] = useState<any>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vData, cData, uData, csData, clData] = await Promise.all([
                    api<any[]>('/vehicules'),
                    api<any[]>('/chauffeurs'),
                    api<any[]>('/utilisateurs'),
                    api<any[]>('/caisses'),
                    api<string[]>('/reports/clients')
                ]);
                setVehicules(vData.map(v => ({ id: v.id, label: v.immatriculation })));
                setChauffeurs(cData.map(c => ({ id: c.id, label: `${c.nom} ${c.prenom}` })));
                setUtilisateurs(uData.map(u => ({ id: u.id, label: `${u.nom} ${u.prenom} (${u.role})` })));
                setCaisses(csData.map(cs => ({ id: cs.id, label: `${cs.periode} (Reste: ${cs.reste})` })));
                setClientNames(clData || []);
            } catch (err) {
                console.error('Failed to fetch expense options:', err);
            }
        };
        if (isOpen) {
            fetchData();
            if (expense) {
                setFormData({
                    ...expense,
                    date: new Date(expense.date).toISOString().split('T')[0]
                });
            } else {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    vehicule_id: '',
                    chauffeur_id: '',
                    utilisateur_id: '',
                    designation: '',
                    montant: 0,
                    caisse_id: '',
                    client: 'Général'
                });
            }
            setError('');
        }
    }, [expense, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const dataToSend = {
            ...formData,
            vehicule_id: formData.vehicule_id || null,
            chauffeur_id: formData.chauffeur_id || null,
            utilisateur_id: formData.utilisateur_id || null,
        };

        try {
            if (expense?.id) {
                const res = await api<any>(`/depenses/${expense.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToSend),
                });
                if (res.alert) {
                    setAlertData(res.alert);
                    setIsAlertOpen(true);
                } else {
                    onSuccess();
                    onClose();
                }
            } else {
                const res = await api<any>('/depenses', {
                    method: 'POST',
                    body: JSON.stringify(dataToSend),
                });
                if (res.alert) {
                    setAlertData(res.alert);
                    setIsAlertOpen(true);
                } else {
                    onSuccess();
                    onClose();
                }
            }
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
                            {expense ? 'Modifier Dépense' : 'Nouvelle Dépense'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Enregistrez une sortie de fonds.</p>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                            <input
                                type="date" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Montant (FCFA)</label>
                            <input
                                type="number" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                                value={formData.montant}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setFormData({ ...formData, montant: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Désignation</label>
                        <input
                            type="text" required
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            placeholder="ex: Carburant Voyage Lomé"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Attribuer à un Client</label>
                        <select
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        >
                            <option value="Général">Général (Dépense globale)</option>
                            {clientNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lier à un Véhicule</label>
                            <select
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                value={formData.vehicule_id}
                                onChange={(e) => setFormData({ ...formData, vehicule_id: e.target.value })}
                            >
                                <option value="">Aucun véhicule</option>
                                {vehicules.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lier à un Chauffeur</label>
                            <select
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                value={formData.chauffeur_id}
                                onChange={(e) => setFormData({ ...formData, chauffeur_id: e.target.value })}
                            >
                                <option value="">Aucun chauffeur</option>
                                {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lier à un Utilisateur (Bénéficiaire interne)</label>
                        <select
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={formData.utilisateur_id}
                            onChange={(e) => setFormData({ ...formData, utilisateur_id: e.target.value })}
                        >
                            <option value="">Aucun utilisateur</option>
                            {utilisateurs.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Déduire de la Caisse</label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            value={formData.caisse_id}
                            onChange={(e) => setFormData({ ...formData, caisse_id: e.target.value })}
                        >
                            <option value="">Sélectionner une caisse</option>
                            {caisses.map(cs => <option key={cs.id} value={cs.id}>{cs.label}</option>)}
                        </select>
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
                                expense ? 'Mettre à jour' : 'Enregistrer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            <NotificationAlertModal 
                isOpen={isAlertOpen} 
                onClose={() => {
                    setIsAlertOpen(false);
                    onSuccess();
                    onClose();
                }} 
                alert={alertData}
            />
        </div>
    );
}
