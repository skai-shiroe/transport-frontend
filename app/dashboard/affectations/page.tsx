'use client';

import React, { useState, useEffect } from 'react';
import api, { APIError } from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import AssignmentModal from '@/app/components/AssignmentModal';

import { Assignment, AssignmentWithRelations } from '@/app/lib/types';

export default function AffectationsPage() {
    const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithRelations | null>(null);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const data = await api<AssignmentWithRelations[]>('/affectations');
            setAssignments(data);
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleAdd = () => {
        setSelectedAssignment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (assignment: AssignmentWithRelations) => {
        setSelectedAssignment(assignment);
        setIsModalOpen(true);
    };

    const handleDelete = async (assignment: AssignmentWithRelations) => {
        if (confirm(`Souhaitez-vous vraiment supprimer cette affectation ?`)) {
            try {
                await api(`/affectations/${assignment.id}`, { method: 'DELETE' });
                fetchAssignments();
            } catch (error: any) {
                if (error?.status === 403) return;
                alert('Erreur lors de la suppression');
            }
        }
    };

    const columns = [
        {
            header: 'Véhicule',
            accessor: (a: AssignmentWithRelations) => (
                <div>
                    <p className="font-bold text-slate-900 uppercase">{a.vehicule?.immatriculation}</p>
                    <p className="text-[10px] text-slate-400">{a.vehicule?.marque}</p>
                </div>
            )
        },
        {
            header: 'Chauffeur',
            accessor: (a: AssignmentWithRelations) => (
                <div>
                    <p className="font-bold text-slate-900">{a.chauffeur?.nom} {a.chauffeur?.prenom}</p>
                </div>
            )
        },
        {
            header: 'Période',
            accessor: (a: AssignmentWithRelations) => (
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600">Début: {new Date(a.date_debut).toLocaleDateString()}</span>
                    {a.date_fin && <span className="text-[10px] text-slate-400">Fin: {new Date(a.date_fin).toLocaleDateString()}</span>}
                </div>
            )
        },
        {
            header: 'Statut',
            accessor: (a: AssignmentWithRelations) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    a.statut === 'EN_COURS' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}>
                    {a.statut}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Affectations</h1>
                    <p className="text-slate-500 text-sm">Liez un chauffeur à un véhicule pour une période donnée.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle affectation
                </button>
            </header>

            <DataTable 
                data={assignments} 
                columns={columns} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AssignmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchAssignments} 
                assignment={selectedAssignment} 
            />
        </div>
    );
}
