'use client';

import React from 'react';
import { usePermission } from '@/app/context/PermissionContext';

export default function PermissionModal() {
    const { isDenied, denialMessage, closeModal } = usePermission();

    if (!isDenied) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-8V5m0 16a9 9 0 110-18 9 9 0 010 18z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-xl font-display font-bold text-slate-900 mb-2">
                        Action Non Autorisée
                    </h2>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        {denialMessage}
                    </p>

                    <button
                        onClick={closeModal}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl transition-all font-bold text-sm shadow-lg shadow-slate-200"
                    >
                        J'ai compris
                    </button>
                </div>
            </div>
        </div>
    );
}
