'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api<{ token: string; user: any }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, mot_de_passe: password }),
            });

            login(response.token, response.user);
        } catch (err: any) {
            setError(err.message || 'Échec de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-cobalt opacity-5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-emerald opacity-5 blur-[100px] rounded-full"></div>

            <div className="w-full max-w-md animate-fade-in">
                <div className="glass p-8 rounded-2xl shadow-2xl relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-display mb-2 text-gradient">TMS Logistics</h1>
                        <p className="text-gray-400">Connectez-vous pour continuer</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand-cobalt/50 transition-all text-white"
                                placeholder="nom@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Mot de passe</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-brand-cobalt/50 transition-all text-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-cobalt hover:bg-brand-cobalt/90 text-white font-semibold p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(46,91,255,0.3)]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Action en cours...
                                </span>
                            ) : (
                                'Se Connecter'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Système de Gestion de Transport © 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
