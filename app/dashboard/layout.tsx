'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { PermissionProvider } from '@/app/context/PermissionContext';
import PermissionModal from '@/app/components/PermissionModal';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-gray flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cobalt"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <PermissionProvider>
            <div className="flex min-h-screen bg-brand-gray text-foreground transition-colors duration-300">
                <div className="no-print">
                    <Sidebar />
                </div>
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div className="no-print">
                        <Header />
                    </div>
                    <main className="flex-1 overflow-y-auto p-6 md:p-8 animate-fade-in">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <PermissionModal />
        </PermissionProvider>
    );
}
