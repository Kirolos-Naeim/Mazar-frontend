'use client';

import { FormEvent, useEffect, useState } from 'react';
import { adminHeaders, api } from '@/lib/api';
import { getClientRole } from '@/lib/session';

type Product = {
  id: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  price: string;
  stock: number;
  isActive: boolean;
};

type ProductForm = {
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: string;
  stock: string;
};

const emptyForm: ProductForm = { name: '', category: '', description: '', imageUrl: '', price: '', stock: '' };
const categoryChoices = ['Meals', 'Sandwiches', 'Wraps', 'Egyptian', 'Beverages', 'Desserts'];

export default function AdminPage() {
  const [allowed, setAllowed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadProducts = () => api.get('/admin/products', { headers: adminHeaders }).then((r) => setProducts(r.data));

  useEffect(() => {
    const role = getClientRole();
    if (role !== 'ADMIN') {
      setAllowed(false);
      return;
    }
    setAllowed(true);
    loadProducts();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      category: form.category || undefined,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: true,
    };

    if (editingId) {
      await api.put(`/admin/products/${editingId}`, payload, { headers: adminHeaders });
    } else {
      await api.post('/admin/products', payload, { headers: adminHeaders });
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadProducts();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      price: String(p.price),
      stock: String(p.stock),
    });
  };

  const removeProduct = async (id: string) => {
    await api.delete(`/admin/products/${id}`, { headers: adminHeaders });
    await loadProducts();
  };

  if (!allowed) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Admin Inventory</h1>
        <p className="text-sm text-slate-600">Access denied. This page is visible only for admin login.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-transition">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
        <p className="mt-1 text-sm text-white/80">Add, edit, and manage all products in one place.</p>
      </div>

      <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Product name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
          <input
            list="category-choices"
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
          />
          <datalist id="category-choices">
            {categoryChoices.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))} />
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} required />
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))} required />
        </div>
        <textarea className="w-full rounded-xl border px-3 py-2 text-sm" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />

        <div className="flex gap-2">
          <button className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white" type="submit">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
          {editingId ? (
            <button type="button" className="rounded-xl border px-3 py-2 text-sm" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm soft-hover">
            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="mb-3 h-36 w-full rounded-xl object-cover" /> : null}
            <div className="font-semibold text-slate-900">{p.name}</div>
            <div className="mt-1 text-xs text-slate-500">{p.category || 'Uncategorized'}</div>
            <div className="mt-2 text-sm text-slate-700">EGP {p.price} • Stock: {p.stock}</div>
            <div className="line-clamp-2 text-xs text-slate-500">{p.description}</div>
            {!p.isActive ? <div className="mt-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">Inactive</div> : null}
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => startEdit(p)}>Edit</button>
              <button className="rounded-lg border px-2 py-1 text-xs text-red-600" onClick={() => removeProduct(p.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
