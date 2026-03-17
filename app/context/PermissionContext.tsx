'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PermissionContextType {
    isDenied: boolean;
    denialMessage: string;
    closeModal: () => void;
    triggerDenial: (message: string) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const [isDenied, setIsDenied] = useState(false);
    const [denialMessage, setDenialMessage] = useState('');

    const closeModal = () => {
        setIsDenied(false);
        setDenialMessage('');
    };

    const triggerDenial = (message: string) => {
        setDenialMessage(message);
        setIsDenied(true);
    };

    useEffect(() => {
        const handlePermissionDenied = (event: any) => {
            triggerDenial(event.detail || 'Accès refusé : permissions insuffisantes');
        };

        window.addEventListener('permission-denied', handlePermissionDenied);
        return () => window.removeEventListener('permission-denied', handlePermissionDenied);
    }, []);

    return (
        <PermissionContext.Provider value={{ isDenied, denialMessage, closeModal, triggerDenial }}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermission() {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
}
