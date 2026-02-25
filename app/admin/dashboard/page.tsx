'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminHeaders, api } from '@/lib/api';
import { getClientRole } from '@/lib/session';

type Product = {
  id: string;
  name: string;
  stock: number;
  category?: string;
  price: string;
};

type Order = {
  id: string;
  items: Array<{
    id: string;
    quantity: number;
    product?: { id?: string; name?: string };
  }>;
};

const LOW_STOCK_THRESHOLD = 10;

export default function AdminDashboardPage() {
  const [allowed, setAllowed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (getClientRole() !== 'ADMIN') {
      setAllowed(false);
      return;
    }

    setAllowed(true);

    Promise.all([
      api.get('/admin/orders', { headers: adminHeaders }),
      api.get('/admin/products', { headers: adminHeaders }),
    ]).then(([ordersRes, productsRes]) => {
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    });
  }, []);

  const topSellers = useMemo(() => {
    const soldMap = new Map<string, { name: string; qty: number }>();

    for (const order of orders) {
      for (const item of order.items || []) {
        const key = item.product?.id || item.product?.name || item.id;
        const name = item.product?.name || 'Unknown Product';
        const prev = soldMap.get(key);
        soldMap.set(key, { name, qty: (prev?.qty || 0) + item.quantity });
      }
    }

    return Array.from(soldMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => a.stock - b.stock)
      .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
      .slice(0, 20);
  }, [products]);

  if (!allowed) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">Access denied. This page is visible only for admin login.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-transition">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-white/80">Most sold products and stock-at-risk overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Total Orders</div>
          <div className="text-2xl font-bold text-slate-900">{orders.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Total Products</div>
          <div className="text-2xl font-bold text-slate-900">{products.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">About to Run Out (≤ {LOW_STOCK_THRESHOLD})</div>
          <div className="text-2xl font-bold text-rose-600">{lowStockProducts.length}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Top Sellers</h2>
          {topSellers.length === 0 ? (
            <p className="text-sm text-slate-500">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {topSellers.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <div className="text-sm text-slate-800">{idx + 1}. {item.name}</div>
                  <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{item.qty} sold</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Low Stock Items</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No low stock items.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2 font-medium text-slate-800">{p.name}</td>
                      <td className="py-2 text-slate-600">{p.category || '-'}</td>
                      <td className="py-2">
                        <span className={p.stock <= 3 ? 'rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700' : 'rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700'}>
                          {p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
