'use client';

import React, { useState } from 'react';
import { formatAmountToFrenchSentence } from '@/app/lib/numberToWords';

interface InvoiceDetailProps {
    facture: any;
    onClose?: () => void;
}

export default function InvoiceDetail({ facture, onClose }: InvoiceDetailProps) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (!facture) return null;

    const bls = facture.bons_livraison || [];
    const totalPoids = bls.reduce((sum: number, bl: any) => sum + (bl.poids_arrive || 0), 0);
    const totalMontant = bls.reduce((sum: number, bl: any) => sum + (bl.montant || 0), 0);
    const puMoyen = bls.length > 0 ? (totalMontant / totalPoids) : 0;

    const dateEmission = new Date(facture.date_emission).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPdf(true);
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('invoice-content');

            if (!element) return;

            // Temporarily hide buttons
            const buttonsContainer = element.querySelector('.print-hide');
            if (buttonsContainer) (buttonsContainer as HTMLElement).style.display = 'none';

            const opt = {
                margin: 0, // mm (rely on element internal padding)
                filename: `Facture_${facture.numero}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();

            // Restore buttons
            if (buttonsContainer) (buttonsContainer as HTMLElement).style.display = '';
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Erreur lors de la génération du PDF');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div id="invoice-content" className="invoice-container p-12 mx-auto max-w-[210mm] shadow-lg border relative group" style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#f1f5f9' }}>
            {/* Header / Emetteur */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-extrabold tracking-wider uppercase" style={{ color: '#dc2626', WebkitTextStroke: '0.5px black', textShadow: '1px 1px 0 #000' }}>
                    {facture.emetteur || 'STE GOD IS GOOD - ANDRE GROUP'}
                </h1>
                {facture.emetteur_subtitle && (
                    <p className="mt-2 text-[12px] font-bold leading-tight px-8">
                        {facture.emetteur_subtitle}
                    </p>
                )}
                <div className="text-[10px] mt-1 font-semibold flex justify-center gap-4">
                    {facture.emetteur_telephone && <span>Tel: {facture.emetteur_telephone}</span>}
                    {facture.emetteur_email && <span>Email: {facture.emetteur_email}</span>}
                </div>
            </div>

            <div className="w-full h-[2px] mb-6" style={{ backgroundColor: '#991b1b' }}></div>

            {/* Date & Date */}
            <div className="text-right mb-4">
                <p className="font-bold text-sm italic">Lomé, Le {dateEmission}</p>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h2 className="text-lg font-bold underline decoration-2 uppercase tracking-wider">
                    FACTURE {facture.numero}
                </h2>
            </div>

            {/* Client Details (Left Aligned Block) */}
            <div className="mb-8 text-[11px] leading-relaxed font-semibold">
                <p className="font-bold text-sm mb-1">{facture.client}</p>
                {facture.client_capital && <p>Société Anonyme au capital de {facture.client_capital}</p>}
                {facture.client_rccm && <p>RCCM : {facture.client_rccm}-</p>}
                <p>
                    {facture.client_ifu && `IFU : ${facture.client_ifu}- `}
                    {facture.client_regime && `Régime fiscal : ${facture.client_regime}-`}
                </p>
                {facture.client_division && <p>Division fiscale : {facture.client_division}-</p>}
                {facture.client_adresse && <p>{facture.client_adresse}-</p>}
                {facture.client_compte_bancaire && <p>BOA : {facture.client_compte_bancaire}</p>}
                {facture.client_telephone && <p>Tel : {facture.client_telephone}</p>}
                {facture.client_email && <p>E-mail : <span className="underline" style={{ color: '#2563eb' }}>{facture.client_email}</span></p>}
            </div>

            {/* Subject */}
            <div className="text-center mb-6">
                <p className="font-bold underline text-sm">
                    Objet : {facture.trajet_description || 'Transport de Marchandises'}
                </p>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse border text-[10px] mb-8" style={{ borderColor: '#0f172a' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                        <th className="border p-2 text-center w-12" style={{ borderColor: '#0f172a' }}>N° d'ordre</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>Véhicule</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>Date de chargement</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>Produit</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>Date de déchargement</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>Bon de livraison</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>Poids d'arrivé</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>P.U</th>
                        <th className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>Montant</th>
                    </tr>
                </thead>
                <tbody>
                    {bls.map((bl: any, index: number) => (
                        <tr key={bl.id}>
                            <td className="border p-2 text-center font-bold" style={{ borderColor: '#0f172a' }}>{index + 1}</td>
                            <td className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>{bl.vehicule?.immatriculation || '-'}</td>
                            <td className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>{bl.date_chargement ? new Date(bl.date_chargement).toLocaleDateString() : '-'}</td>
                            <td className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>{bl.produit?.nom || 'Marchandise'}</td>
                            <td className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>{bl.date_livraison ? new Date(bl.date_livraison).toLocaleDateString() : '-'}</td>
                            <td className="border p-2 text-center font-mono" style={{ borderColor: '#0f172a' }}>{bl.numero}</td>
                            <td className="border p-2 text-center font-bold" style={{ borderColor: '#0f172a' }}>{bl.poids_arrive?.toLocaleString()}</td>
                            <td className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>{(bl.montant / bl.poids_arrive || 0).toLocaleString()}</td>
                            <td className="border p-2 text-center font-bold" style={{ borderColor: '#0f172a' }}>{bl.montant?.toLocaleString()}</td>
                        </tr>
                    ))}
                    {/* Summary Row */}
                    <tr className="font-bold uppercase text-[11px]" style={{ backgroundColor: '#f8fafc' }}>
                        <td colSpan={6} className="border p-2 text-center" style={{ borderColor: '#0f172a' }}>TOTAL</td>
                        <td className="border p-2 text-center underline decoration-2" style={{ borderColor: '#0f172a' }}>{totalPoids.toLocaleString()}</td>
                        <td className="border p-2 text-center font-normal italic" style={{ borderColor: '#0f172a' }}>{(totalMontant / totalPoids || 0).toLocaleString()}</td>
                        <td className="border p-2 text-center underline decoration-2" style={{ borderColor: '#0f172a' }}>{totalMontant.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            {/* Footer Text */}
            <div className="mb-20">
                <p className="text-sm font-bold italic leading-relaxed">
                    Arrêté la présente facture à la somme de : {totalMontant.toLocaleString()} FCFA ({formatAmountToFrenchSentence(totalMontant)}).
                </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-start text-xs font-bold px-12">
                <div className="text-center">
                    <p className="underline mb-24 uppercase">Le Comptable</p>
                </div>
                <div className="text-center">
                    <p className="underline mb-24 uppercase">LA DIRECTION</p>
                    <div className="mb-16" />
                    <p className="mt-12">AGBEKO André</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-12 print-hide">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="bg-white text-slate-500 border border-soft-border px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Retour
                    </button>
                )}
                <button
                    onClick={() => window.print()}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Imprimer Version Classique
                </button>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {isGeneratingPdf ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    {isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}
                </button>
            </div>
        </div>
    );
}
