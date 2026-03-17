'use client';

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 border-b border-soft-border flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-40 transition-colors duration-300">
            <div>
                <h2 className="text-lg font-display font-semibold text-slate-800">Vue d'ensemble</h2>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-900 border border-transparent hover:border-soft-border"
                    title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                <div className="h-8 w-[1px] bg-soft-border mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-slate-900 leading-none">{user?.nom}</p>
                        <p className="text-[10px] text-slate-500 capitalize mt-1">{user?.role?.toLowerCase()}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
                        title="Déconnexion"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
