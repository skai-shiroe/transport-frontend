'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import NotificationAlertModal from './NotificationAlertModal';

interface Facture {
    id?: string;
    numero: string;

    // Emetteur
    emetteur: string;
    emetteur_subtitle?: string;
    emetteur_telephone?: string;
    emetteur_email?: string;

    // Client
    client: string;
    client_capital?: string;
    client_rccm?: string;
    client_ifu?: string;
    client_regime?: string;
    client_division?: string;
    client_adresse?: string;
    client_compte_bancaire?: string;
    client_telephone?: string;
    client_email?: string;

    trajet_description: string;
    date_emission: string;
    statut: 'BROUILLON' | 'EMISE' | 'PAYEE';
    bons_livraison?: any[];
}

interface BL {
    id: string;
    numero: string;
    poids_arrive: number;
    montant: number;
    facture_id: string | null;
}

interface FactureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    facture?: Facture | null;
}

export default function FactureModal({ isOpen, onClose, onSuccess, facture }: FactureModalProps) {
    const [formData, setFormData] = useState<Facture>({
        numero: '',
        emetteur: 'STE GOD IS GOOD - ANDRE GROUP',
        emetteur_subtitle: 'Commerce Général, Import-Export, (Quincaillerie, Vente de Planches et Chevrons) Prestation de Services (Transport de Marchandises, Rabotage et Sciage de Planches et Transformation Industrielle)',
        emetteur_telephone: '',
        emetteur_email: '',

        client: '',
        client_capital: '1 000 000 000 FCFA',
        client_rccm: 'BF 2018 M 6062',
        client_ifu: '0039794U',
        client_regime: 'RNI',
        client_division: 'DGE Zone Industrielle KOSSODO',
        client_adresse: 'Secteur 25, Section 705, Lot : 06 - Parcelle : 00 01 BP 5604 Ouagadougou 01, Burkina Faso',
        client_compte_bancaire: 'BF 084 01015 00725001012570',
        client_telephone: '(+226) 25 40 77 95 / 96',
        client_email: 'Contact.BF@cimentsafrique.com',

        trajet_description: '',
        date_emission: new Date().toISOString().split('T')[0],
        statut: 'BROUILLON'
    });

    const [availableBLs, setAvailableBLs] = useState<BL[]>([]);
    const [selectedBLIds, setSelectedBLIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [alertData, setAlertData] = useState<any>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        const fetchBLs = async () => {
            try {
                const data = await api<BL[]>('/bons-livraison');
                // Filter BLs that are not already in a facture (unless it's THIS facture)
                setAvailableBLs(data.filter(bl => !bl.facture_id || bl.facture_id === facture?.id));
            } catch (err) {
                console.error('Failed to fetch BLs:', err);
            }
        };

        if (isOpen) {
            fetchBLs();
            if (facture) {
                setFormData({
                    ...facture,
                    date_emission: new Date(facture.date_emission).toISOString().split('T')[0]
                });
                setSelectedBLIds(facture.bons_livraison?.map(bl => bl.id) || []);
            } else {
                setFormData({
                    numero: `FACT-${Date.now().toString().slice(-6)}`,
                    emetteur: 'STE GOD IS GOOD - ANDRE GROUP',
                    emetteur_subtitle: 'Commerce Général, Import-Export, (Quincaillerie, Vente de Planches... Transport de Marchandises)',
                    emetteur_telephone: '',
                    emetteur_email: '',
                    client: '',
                    client_capital: '1 000 000 000 FCFA',
                    client_rccm: 'BF 2018 M 6062',
                    client_ifu: '0039794U',
                    client_regime: 'RNI',
                    client_division: 'DGE Zone Industrielle KOSSODO',
                    client_adresse: 'Secteur 25... Burkina Faso',
                    client_compte_bancaire: 'BF 084 01015 00725001012570',
                    client_telephone: '(+226) 25 40 77 95 / 96',
                    client_email: 'Contact.BF@cimentsafrique.com',
                    trajet_description: '',
                    date_emission: new Date().toISOString().split('T')[0],
                    statut: 'BROUILLON'
                });
                setSelectedBLIds([]);
            }
            setError('');
        }
    }, [facture, isOpen]);

    if (!isOpen) return null;

    const toggleBL = (id: string) => {
        setSelectedBLIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Strictly whitelist properties allowed by the backend (Elysia validation schema)
            const payload = {
                numero: formData.numero,
                emetteur: formData.emetteur,
                emetteur_subtitle: formData.emetteur_subtitle || undefined,
                emetteur_telephone: formData.emetteur_telephone || undefined,
                emetteur_email: formData.emetteur_email || undefined,
                client: formData.client,
                client_capital: formData.client_capital || undefined,
                client_rccm: formData.client_rccm || undefined,
                client_ifu: formData.client_ifu || undefined,
                client_regime: formData.client_regime || undefined,
                client_division: formData.client_division || undefined,
                client_adresse: formData.client_adresse || undefined,
                client_compte_bancaire: formData.client_compte_bancaire || undefined,
                client_telephone: formData.client_telephone || undefined,
                client_email: formData.client_email || undefined,
                trajet_description: formData.trajet_description,
                date_emission: formData.date_emission,
                statut: formData.statut
            };

            let savedFacture: any;
            let alertFromApi = null;
            if (facture?.id) {
                const res = await api<any>(`/factures/${facture.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                savedFacture = res;
                alertFromApi = res.alert;
            } else {
                const res = await api<any>('/factures', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                savedFacture = res;
                alertFromApi = res.alert;
            }

            // Associate selected BLs
            if (savedFacture.id && selectedBLIds.length > 0) {
                await api(`/factures/${savedFacture.id}/bons-livraison`, {
                    method: 'POST',
                    body: JSON.stringify({ bl_ids: selectedBLIds }),
                });
            }

            if (alertFromApi) {
                setAlertData(alertFromApi);
                setIsAlertOpen(true);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl border border-soft-border animate-slide-in max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">
                            {facture ? 'Modifier Facture' : 'Nouvelle Facture'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Génération d'un bordereau de facturation.</p>
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">N° Facture</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                                value={formData.numero}
                                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Emission</label>
                            <input
                                type="date" required
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                value={formData.date_emission}
                                onChange={(e) => setFormData({ ...formData, date_emission: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Client</label>
                        <input
                            type="text" required
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            placeholder="Nom du client (ex: CIMAF Burkina Faso)"
                        />
                    </div>

                    <details className="group mt-4 mb-4 border border-soft-border rounded-xl bg-slate-50">
                        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-sm text-slate-700 select-none">
                            Informations de l'Émetteur
                            <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div className="p-4 pt-0 grid grid-cols-2 gap-4 border-t border-soft-border mt-2">
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom Émetteur</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.emetteur} onChange={(e) => setFormData({ ...formData, emetteur: e.target.value })} />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sous-titre / Description Émetteur</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.emetteur_subtitle || ''} onChange={(e) => setFormData({ ...formData, emetteur_subtitle: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Téléphone Émetteur</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.emetteur_telephone || ''} onChange={(e) => setFormData({ ...formData, emetteur_telephone: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Émetteur</label>
                                <input type="email" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.emetteur_email || ''} onChange={(e) => setFormData({ ...formData, emetteur_email: e.target.value })} />
                            </div>
                        </div>
                    </details>

                    <details className="group mt-4 mb-4 border border-soft-border rounded-xl bg-slate-50">
                        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-sm text-slate-700 select-none">
                            Informations du Client (Mentions Légales)
                            <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div className="p-4 pt-0 grid grid-cols-2 gap-4 border-t border-soft-border mt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Capital Social</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_capital || ''} onChange={(e) => setFormData({ ...formData, client_capital: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">RCCM</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_rccm || ''} onChange={(e) => setFormData({ ...formData, client_rccm: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IFU</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_ifu || ''} onChange={(e) => setFormData({ ...formData, client_ifu: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Régime Fiscal</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_regime || ''} onChange={(e) => setFormData({ ...formData, client_regime: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Division Fiscale</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_division || ''} onChange={(e) => setFormData({ ...formData, client_division: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Compte Bancaire (BOA)</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_compte_bancaire || ''} onChange={(e) => setFormData({ ...formData, client_compte_bancaire: e.target.value })} />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Adresse Complète</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_adresse || ''} onChange={(e) => setFormData({ ...formData, client_adresse: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                                <input type="text" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_telephone || ''} onChange={(e) => setFormData({ ...formData, client_telephone: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input type="email" className="w-full bg-white border border-soft-border px-3 py-2 rounded-lg outline-none text-xs" value={formData.client_email || ''} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })} />
                            </div>
                        </div>
                    </details>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bons de Livraison Disponibles</label>
                        <div className="bg-slate-50 border border-soft-border rounded-xl divide-y divide-soft-border max-h-48 overflow-y-auto">
                            {availableBLs.length === 0 ? (
                                <p className="p-4 text-xs text-slate-400 italic text-center">Aucun bon disponible pour ce client ou trajet.</p>
                            ) : (
                                availableBLs.map(bl => (
                                    <label key={bl.id} className="flex items-center justify-between p-3 hover:bg-white cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedBLIds.includes(bl.id)}
                                                onChange={() => toggleBL(bl.id)}
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{bl.numero}</p>
                                                <p className="text-[10px] text-slate-400">{bl.poids_arrive} T - {bl.montant.toLocaleString()} FCFA</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold ${selectedBLIds.includes(bl.id) ? 'text-indigo-600' : 'text-slate-300'}`}>
                                            {selectedBLIds.includes(bl.id) ? 'Sélectionné' : 'Ajouter'}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description Trajet</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                            value={formData.trajet_description}
                            onChange={(e) => setFormData({ ...formData, trajet_description: e.target.value })}
                            placeholder="ex: Lomé - Ouagadougou"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                            <select
                                className="w-full bg-slate-50 border border-soft-border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                value={formData.statut}
                                onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                            >
                                <option value="BROUILLON">BROUILLON</option>
                                <option value="EMISE">ÉMISE</option>
                                <option value="PAYEE">PAYÉE</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-center">Total Facturé</p>
                                <p className="text-sm font-bold text-indigo-600 text-center">
                                    {availableBLs
                                        .filter(bl => selectedBLIds.includes(bl.id))
                                        .reduce((sum, bl) => sum + bl.montant, 0)
                                        .toLocaleString()} FCFA
                                </p>
                            </div>
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
                                facture ? 'Mettre à jour' : 'Générer Facture'
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
