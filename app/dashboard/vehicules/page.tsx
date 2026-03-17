'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import VehicleModal from '@/app/components/VehicleModal';

interface Vehicle {
    id: string;
    immatriculation: string;
    marque: string;
    type: 'TRACTEUR' | 'REMORQUE' | 'PORTEUR';
    statut: 'DISPONIBLE' | 'EN_ROUTE' | 'EN_PANNE' | 'EN_MAINTENANCE';
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const data = await api<Vehicle[]>('/vehicules');
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleAdd = () => {
        setSelectedVehicle(null);
        setIsModalOpen(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleDelete = async (vehicle: Vehicle) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le véhicule "${vehicle.immatriculation}" ?`)) {
            try {
                await api(`/vehicules/${vehicle.id}`, { method: 'DELETE' });
                fetchVehicles();
            } catch (error: any) {
                if (error?.status === 403) return;
                alert('Erreur lors de la suppression');
            }
        }
    };

    const columns = [
        {
            header: 'Véhicule',
            accessor: (v: Vehicle) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {v.immatriculation.slice(0, 2)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 uppercase">{v.immatriculation}</p>
                        <p className="text-[10px] text-slate-400">{v.marque}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Type', 
            accessor: (v: Vehicle) => (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {v.type}
                </span>
            )
        },
        {
            header: 'Statut',
            accessor: (v: Vehicle) => {
                const colors: Record<string, string> = {
                    'DISPONIBLE': 'bg-emerald-50 text-emerald-600',
                    'EN_ROUTE': 'bg-blue-50 text-blue-600',
                    'EN_PANNE': 'bg-rose-50 text-rose-600',
                    'EN_MAINTENANCE': 'bg-amber-50 text-amber-600'
                };
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[v.statut] || 'bg-slate-100 text-slate-500'}`}>
                        {v.statut.replace('_', ' ')}
                    </span>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Flotte Automobile</h1>
                    <p className="text-slate-500 text-sm">Gérez vos véhicules, tracteurs et remorques.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un véhicule
                </button>
            </header>

            <DataTable 
                data={vehicles} 
                columns={columns} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <VehicleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchVehicles} 
                vehicle={selectedVehicle} 
            />
        </div>
    );
}
