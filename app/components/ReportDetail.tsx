'use client';

import React, { useState } from 'react';

interface ReportDetailProps {
    report: any;
    selectedClient: string;
    startDate: string;
    endDate: string;
    onClose?: () => void;
}

export default function ReportDetail({ report, selectedClient, startDate, endDate, onClose }: ReportDetailProps) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (!report) return null;

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString() + ' FCFA';
    };

    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPdf(true);
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('report-content');

            if (!element) return;

            // Masquer les boutons pendant la génération
            const buttonsContainer = element.querySelector('.print-hide');
            if (buttonsContainer) (buttonsContainer as HTMLElement).style.display = 'none';

            const opt = {
                margin: 0,
                filename: `Rapport_Rentabilite_${startDate}_au_${endDate}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();

            // Restaurer les boutons
            if (buttonsContainer) (buttonsContainer as HTMLElement).style.display = '';
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Erreur lors de la génération du PDF');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div id="report-content" className="invoice-container p-12 mx-auto max-w-[210mm] shadow-lg border relative group" style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#f1f5f9' }}>
            <div className="text-center border-b-2 border-black pb-8 mb-8" style={{ borderColor: '#0f172a' }}>
                <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2" style={{ color: '#dc2626', WebkitTextStroke: '0.5px black', textShadow: '1px 1px 0 #000' }}>
                    STE GOD IS GOOD - ANDRE GROUP
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#1e293b' }}>Commerce Général • Import-Export • Transport de Marchandises</p>
                <div className="mt-4 flex justify-center gap-8 text-[10px] font-bold uppercase">
                    <span>Tél: (+226) 25 40 77 95 / 96</span>
                    <span>Email: info@andregroup.com</span>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-center underline decoration-2 underline-offset-8 mb-6 uppercase">
                    RAPPORT MONDIAL DE RENTABILITÉ
                </h2>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div className="space-y-1">
                        <p><span className="font-bold">Client :</span> {selectedClient || 'Tous les clients'}</p>
                        <p><span className="font-bold">Période :</span> Du {new Date(startDate).toLocaleDateString()} au {new Date(endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p><span className="font-bold">Généré le :</span> {new Date().toLocaleString()}</p>
                        <p><span className="font-bold">Émis par :</span> Direction Financière</p>
                    </div>
                </div>
            </div>

            {/* Tableau de Synthèse Financial */}
            <div className="mb-8">
                <h3 className="text-sm font-bold p-2 mb-4 border-l-4 border-black uppercase tracking-widest" style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}>
                    I. RÉCAPITULATIF FINANCIER
                </h3>
                <table className="w-full border-collapse border" style={{ borderColor: '#0f172a' }}>
                    <thead>
                        <tr className="text-[10px] uppercase" style={{ backgroundColor: '#f8fafc' }}>
                            <th className="border p-3 text-left" style={{ borderColor: '#0f172a' }}>Désignation des flux</th>
                            <th className="border p-3 text-right" style={{ borderColor: '#0f172a' }}>Montant (FCFA)</th>
                            <th className="border p-3 text-center" style={{ borderColor: '#0f172a' }}>Taux / Obs.</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        <tr>
                            <td className="border p-3 font-medium" style={{ borderColor: '#0f172a' }}>Revenu Total (Bons de Livraison Facturés)</td>
                            <td className="border p-3 text-right font-bold" style={{ borderColor: '#0f172a' }}>{report?.revenue.toLocaleString()}</td>
                            <td className="border p-3 text-center" style={{ borderColor: '#0f172a' }}>Entrée brute</td>
                        </tr>
                        <tr>
                            <td className="border p-3 font-medium" style={{ borderColor: '#0f172a' }}>Dépenses Opérationnelles Totales</td>
                            <td className="border p-3 text-right font-bold" style={{ borderColor: '#0f172a', color: '#dc2626' }}>({report?.expenses.toLocaleString()})</td>
                            <td className="border p-3 text-center" style={{ borderColor: '#0f172a', color: '#dc2626' }}>Sorties de caisse</td>
                        </tr>
                        <tr className="font-bold text-sm" style={{ backgroundColor: '#f8fafc' }}>
                            <td className="border border-black p-4 uppercase" style={{ borderColor: '#0f172a', borderWidth: '2px' }}>BÉNÉFICE NET DE LA PÉRIODE</td>
                            <td className="border border-black p-4 text-right" style={{ borderColor: '#0f172a', borderWidth: '2px', color: report && report.profit >= 0 ? '#047857' : '#b91c1c' }}>
                                {report?.profit.toLocaleString()}
                            </td>
                            <td className="border border-black p-4 text-center text-[10px]" style={{ borderColor: '#0f172a', borderWidth: '2px' }}>
                                {report && report.revenue > 0 ? ((report.profit / report.revenue) * 100).toFixed(1) + '%' : '-'} Marge
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Tableau de Détail Charges */}
            <div className="mb-8">
                <h3 className="text-sm font-bold p-2 mb-4 border-l-4 border-black uppercase tracking-widest" style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}>
                    II. DÉTAILS DES CHARGES PAR CATÉGORIE
                </h3>
                <table className="w-full border-collapse border" style={{ borderColor: '#0f172a' }}>
                    <thead>
                        <tr className="text-[10px] uppercase" style={{ backgroundColor: '#f8fafc' }}>
                            <th className="border p-2 text-left" style={{ borderColor: '#0f172a' }}>Catégorie de Dépense</th>
                            <th className="border p-2 text-right" style={{ borderColor: '#0f172a' }}>Montant (FCFA)</th>
                            <th className="border p-2 text-right" style={{ borderColor: '#0f172a' }}>Part (%)</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px]">
                        {report && Object.entries(report.expensesByCategory).length > 0 ? (
                            Object.entries(report.expensesByCategory)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .map(([label, value]) => (
                                    <tr key={label}>
                                        <td className="border p-2 uppercase font-bold" style={{ borderColor: '#0f172a' }}>{label}</td>
                                        <td className="border p-2 text-right" style={{ borderColor: '#0f172a' }}>{(value as number).toLocaleString()}</td>
                                        <td className="border p-2 text-right font-medium" style={{ borderColor: '#0f172a' }}>
                                            {(((value as number) / report.expenses) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr><td colSpan={3} className="border p-8 text-center italic" style={{ borderColor: '#0f172a' }}>Aucune dépense enregistrée sur cette période.</td></tr>
                        )}
                        <tr className="font-bold text-xs" style={{ backgroundColor: '#f8fafc' }}>
                            <td className="border p-2 text-right uppercase" style={{ borderColor: '#0f172a' }}>TOTAL GÉNÉRAL</td>
                            <td className="border p-2 text-right underline decoration-double" style={{ borderColor: '#0f172a' }}>{report?.expenses.toLocaleString()}</td>
                            <td className="border p-2 text-right" style={{ borderColor: '#0f172a' }}>100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Signatures */}
            <div className="mt-12 pt-8">
                <div className="grid grid-cols-2 gap-32">
                    <div className="text-center pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-12 underline">Le Comptable</p>
                        <div className="h-16"></div>
                    </div>
                    <div className="text-center pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-12 underline">LA DIRECTION</p>
                        <div className="h-16"></div>
                        <p className="text-xs font-bold mt-4">AGBEKO André</p>
                    </div>
                </div>
                <div className="mt-8 text-center text-[9px] uppercase tracking-widest font-semibold border-t border-dashed pt-4" style={{ borderColor: '#cbd5e1' }}>
                    Document certifié conforme aux écritures de caisse - Page 1 / 1
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8 print-hide pb-4">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 text-xs shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Retour
                    </button>
                )}
                <button
                    onClick={() => window.print()}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2 text-xs shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Imprimer (Système)
                </button>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs"
                >
                    {isGeneratingPdf ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    {isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}
                </button>
            </div>
        </div>
    );
}
