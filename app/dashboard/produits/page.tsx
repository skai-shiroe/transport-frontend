'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import DataTable from '@/app/components/DataTable';
import ProductModal from '@/app/components/ProductModal';

export interface Product {
    id: string;
    nom: string;
    description: string | null;
    unite: 'TONNE' | 'KG' | 'M3' | 'LITRE';
    prix_unitaire_defaut: number;
    statut: 'ACTIF' | 'INACTIF';
}

export default function ProduitsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await api<Product[]>('/produits');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (product: Product) => {
        if (confirm(`Supprimer le produit ${product.nom} ?`)) {
            try {
                await api(`/produits/${product.id}`, { method: 'DELETE' });
                fetchProducts();
            } catch (error: any) {
                if (error?.status === 403) return;
                alert('Erreur lors de la suppression');
            }
        }
    };

    const columns = [
        {
            header: 'Produit',
            accessor: (p: Product) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {p.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{p.nom}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{p.description || "Aucune description"}</p>
                    </div>
                </div>
            )
        },
        { 
            header: 'Unité', 
            accessor: (p: Product) => <span className="text-[10px] font-bold text-slate-400">{p.unite}</span>
        },
        { 
            header: 'Prix Unitaire', 
            accessor: (p: Product) => (
                <span className="font-bold text-slate-900">
                    {p.prix_unitaire_defaut.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">FCFA</span>
                </span>
            )
        },
        {
            header: 'Statut',
            accessor: (p: Product) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.statut === 'ACTIF' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {p.statut}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Catalogue Produits</h1>
                    <p className="text-slate-500 text-sm">Gérez les marchandises transportées et leurs prix.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau produit
                </button>
            </header>

            <DataTable 
                data={products} 
                columns={columns} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchProducts} 
                product={selectedProduct} 
            />
        </div>
    );
}
