'use client';

import React, { useState, useEffect } from 'react';
import api, { APIError } from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import DriverModal from '@/app/components/DriverModal';

import { Driver, DriverWithId } from '@/app/lib/types';

export default function DriversPage() {
    const [drivers, setDrivers] = useState<DriverWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const data = await api<DriverWithId[]>('/chauffeurs');
            setDrivers(data);
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleAdd = () => {
        setSelectedDriver(null);
        setIsModalOpen(true);
    };

    const handleEdit = (driver: DriverWithId) => {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    };

    const handleDelete = async (driver: DriverWithId) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le chauffeur "${driver.nom} ${driver.prenom}" ?`)) {
            try {
                await api(`/chauffeurs/${driver.id}`, { method: 'DELETE' });
                fetchDrivers();
            } catch (error: any) {
                if (error?.status === 403) return;
                alert('Erreur lors de la suppression');
            }
        }
    };

    const columns = [
        {
            header: 'Chauffeur',
            accessor: (d: DriverWithId) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {d.nom.charAt(0)}{d.prenom.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{d.nom} {d.prenom}</p>
                        <p className="text-[10px] text-slate-400">{d.nationalite}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Contact', 
            accessor: (d: DriverWithId) => (
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600">{d.telephone_1}</span>
                    {d.telephone_2 && <span className="text-[10px] text-slate-400">{d.telephone_2}</span>}
                </div>
            )
        },
        {
            header: 'Permis',
            accessor: (d: DriverWithId) => (
                <div>
                    <p className="text-xs font-bold text-slate-700">{d.numero_permis}</p>
                    <p className="text-[10px] text-slate-400">Exp: {new Date(d.date_expiration_permis).toLocaleDateString()}</p>
                </div>
            )
        },
        {
            header: 'Statut',
            accessor: (d: DriverWithId) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.statut === 'ACTIF' ? 'bg-emerald-50 text-emerald-600' : 
                    d.statut === 'SUSPENDU' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                }`}>
                    {d.statut}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Gestion des Chauffeurs</h1>
                    <p className="text-slate-500 text-sm">Administration des conducteurs et leurs habilitations.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un chauffeur
                </button>
            </header>

            <DataTable 
                data={drivers} 
                columns={columns} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <DriverModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchDrivers} 
                driver={selectedDriver} 
            />
        </div>
    );
}
