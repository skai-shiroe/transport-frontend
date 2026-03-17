'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import UserModal from '@/app/components/UserModal';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: 'ADMIN' | 'GESTIONNAIRE' | 'LECTEUR';
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { user: currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (currentUser && currentUser.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [currentUser, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api<User[]>('/utilisateurs');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [currentUser]);

    const handleAdd = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (user: User) => {
        if (user.id === currentUser?.id) {
            alert("Vous ne pouvez pas supprimer votre propre compte.");
            return;
        }
        if (confirm(`Supprimer l'utilisateur ${user.nom} ${user.prenom} ?`)) {
            try {
                await api(`/utilisateurs/${user.id}`, { method: 'DELETE' });
                fetchUsers();
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const columns = [
        {
            header: 'Utilisateur',
            accessor: (u: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {u.nom.charAt(0)}{u.prenom.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{u.nom} {u.prenom}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Rôle',
            accessor: (u: User) => {
                const colors: Record<string, string> = {
                    'ADMIN': 'bg-indigo-50 text-indigo-600',
                    'GESTIONNAIRE': 'bg-blue-50 text-blue-600',
                    'LECTEUR': 'bg-slate-100 text-slate-500'
                };
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[u.role] || 'bg-slate-100 text-slate-500'}`}>
                        {u.role}
                    </span>
                );
            }
        },
        {
            header: 'Créé le',
            accessor: (u: User) => new Date(u.created_at).toLocaleDateString()
        }
    ];

    if (currentUser?.role !== 'ADMIN') return null;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Utilisateurs</h1>
                    <p className="text-slate-500 text-sm">Gérez les accès et les permissions de l'équipe.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un utilisateur
                </button>
            </header>

            <DataTable 
                data={users} 
                columns={columns} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchUsers} 
                user={selectedUser} 
            />
        </div>
    );
}
