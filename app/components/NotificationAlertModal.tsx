'use client';

import React from 'react';

interface AdminInfo {
    nom: string;
    prenom: string;
    telephone?: string;
    email: string;
}

interface AlertInfo {
    type: 'CAISSE_VIDE' | 'PAIEMENT_RECU';
    message: string;
    admins: AdminInfo[];
}

interface NotificationAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    alert: AlertInfo | null;
}

export default function NotificationAlertModal({ isOpen, onClose, alert }: NotificationAlertModalProps) {
    if (!isOpen || !alert) return null;

    const getWhatsAppLink = (phone: string, message: string) => {
        const cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    const getEmailLink = (email: string, subject: string, body: string) => {
        return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const getTitle = () => {
        switch (alert.type) {
            case 'CAISSE_VIDE': return '⚠️ Alerte Trésorerie : Caisse Épuisée';
            case 'PAIEMENT_RECU': return '✅ Nouveau Paiement Reçu';
            default: return 'Notification Système';
        }
    };

    const getStyle = () => {
        switch (alert.type) {
            case 'CAISSE_VIDE': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'PAIEMENT_RECU': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md animate-fade-in flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative shadow-2xl border border-soft-border animate-slide-in">
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full border text-xs font-bold mb-4 ${getStyle()}`}>
                        {getTitle()}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Notification Administrateur</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {alert.message}
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Choisir un administrateur à notifier</p>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {alert.admins.filter(a => a.telephone || a.email).map((admin, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-soft-border">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-slate-700">{admin.nom} {admin.prenom}</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md font-bold uppercase">Admin</span>
                                </div>
                                <div className="flex gap-2">
                                    {admin.telephone && (
                                        <a
                                            href={getWhatsAppLink(admin.telephone, alert.message)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            WhatsApp
                                        </a>
                                    )}
                                    <a
                                        href={getEmailLink(admin.email, getTitle(), alert.message)}
                                        className="flex-1 bg-slate-900 hover:bg-black text-white text-[10px] font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        Email
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-2xl border border-soft-border text-slate-500 hover:bg-slate-50 transition-all font-bold text-xs"
                    >
                        Ignorer
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-2xl transition-all shadow-lg text-xs"
                    >
                        Terminé
                    </button>
                </div>
            </div>
        </div>
    );
}
