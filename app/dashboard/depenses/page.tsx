'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import ExpenseModal from '@/app/components/ExpenseModal';
import StatCard from '@/app/components/StatCard';

interface Expense {
    id: string;
    date: string;
    vehicule_id: string;
    chauffeur_id: string;
    designation: string;
    montant: number;
    caisse_id: string;
    vehicule: { immatriculation: string };
    chauffeur: { nom: string; prenom: string };
    caisse: { periode: string };
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await api<Expense[]>('/depenses');
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleAdd = () => {
        setSelectedExpense(null);
        setIsModalOpen(true);
    };

    const handleEdit = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (expense: Expense) => {
        if (confirm(`Supprimer la dépense de ${expense.montant} FCFA ?`)) {
            try {
                await api(`/depenses/${expense.id}`, { method: 'DELETE' });
                fetchExpenses();
            } catch (error: any) {
                if (error?.status === 403) return;
                alert('Erreur lors de la suppression');
            }
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.montant, 0);

    const columns = [
        {
            header: 'Désignation',
            accessor: (e: Expense) => (
                <div>
                    <p className="font-bold text-slate-900">{e.designation}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Caisse: {e.caisse?.periode}</p>
                </div>
            )
        },
        {
            header: 'Véhicule & Chauffeur',
            accessor: (e: Expense) => (
                <div>
                    <p className="text-xs font-bold text-slate-700">{e.vehicule?.immatriculation}</p>
                    <p className="text-[10px] text-slate-400">{e.chauffeur?.nom} {e.chauffeur?.prenom}</p>
                </div>
            )
        },
        {
            header: 'Montant',
            accessor: (e: Expense) => (
                <span className="font-mono font-bold text-rose-600">
                    -{e.montant.toLocaleString()} FCFA
                </span>
            )
        },
        {
            header: 'Date',
            accessor: (e: Expense) => new Date(e.date).toLocaleDateString()
        }
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Dépenses</h1>
                    <p className="text-slate-500 text-sm">Contrôlez vos charges opérationnelles.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Enregistrer une dépense
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Dépenses" 
                    value={`${totalExpenses.toLocaleString()} FCFA`} 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="rose"
                />
            </div>

            <DataTable 
                data={expenses} 
                columns={columns} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ExpenseModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchExpenses} 
                expense={selectedExpense} 
            />
        </div>
    );
}
