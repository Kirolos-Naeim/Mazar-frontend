'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, currentAuthHeaders } from '@/lib/api';

type Order = { id: string; status: string; total: string; createdAt: string; paymentMethod?: string; address?: string };
const PER_PAGE = 6;

const statusClasses: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const headers = currentAuthHeaders();
    if (!headers) {
      setBlocked(true);
      return;
    }

    api.get('/orders/my', { headers }).then((r) => setOrders(r.data));
  }, []);

  const totalPages = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const pagedOrders = useMemo(() => orders.slice((page - 1) * PER_PAGE, page * PER_PAGE), [orders, page]);

  useEffect(() => {
    setPage(1);
  }, [orders.length]);

  if (blocked) {
    return (
      <div className="space-y-3 page-transition">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold">My Orders</h1>
          <p className="mt-2 text-sm text-slate-600">Please login as customer to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-transition">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="mt-1 text-sm text-white/80">Track your recent purchases and their delivery status.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No orders yet.</div>
      ) : (
        <>
          <div className="grid gap-3">
            {pagedOrders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm soft-hover">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-slate-500">Order #{o.id.slice(0, 10)}</div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[o.status] || 'bg-slate-100 text-slate-700'}`}>
                    {o.status}
                  </span>
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">EGP {o.total}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleString()} {o.paymentMethod ? `• ${o.paymentMethod}` : ''}
                </div>
                {o.address ? <div className="mt-2 text-sm text-slate-600">Address: {o.address}</div> : null}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <button className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
