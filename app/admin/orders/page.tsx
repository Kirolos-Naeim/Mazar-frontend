'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminHeaders, api } from '@/lib/api';
import { getClientRole } from '@/lib/session';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as const;
const PER_PAGE = 6;

type Order = {
  id: string;
  status: string;
  total: string;
  paymentMethod: string;
  address: string;
  notes?: string;
  user?: { id: string; name?: string; username?: string; phone: string; address?: string; location?: string };
  items: Array<{ id: string; quantity: number; unitPrice: string; product?: { name: string } }>;
};

const statusClass: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function AdminOrdersPage() {
  const [allowed, setAllowed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    const res = await api.get('/admin/orders', { headers: adminHeaders });
    setOrders(res.data);
  };

  useEffect(() => {
    if (getClientRole() !== 'ADMIN') {
      setAllowed(false);
      return;
    }
    setAllowed(true);
    load();
  }, []);

  const openDetails = async (id: string) => {
    const res = await api.get(`/admin/orders/${id}`, { headers: adminHeaders });
    setSelected(res.data);
  };

  const changeStatus = async (id: string, status: string) => {
    await api.put(`/admin/orders/${id}/status`, { status }, { headers: adminHeaders });
    await load();
    if (selected?.id === id) await openDetails(id);
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const pagedOrders = useMemo(() => orders.slice((page - 1) * PER_PAGE, page * PER_PAGE), [orders, page]);

  useEffect(() => {
    setPage(1);
  }, [orders.length]);

  if (!allowed) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Admin Orders</h1>
        <p className="text-sm text-slate-600">Access denied. This page is visible only for admin login.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-transition">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <h1 className="text-2xl font-semibold">Orders Dashboard</h1>
        <p className="mt-1 text-sm text-white/80">Review orders, customer details, and update status quickly.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {pagedOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm soft-hover">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">#{o.id.slice(0, 12)}</div>
                  <div className="text-xs text-slate-600">{o.user?.name || o.user?.username || 'Customer'} • {o.user?.phone}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[o.status] || 'bg-slate-100 text-slate-700'}`}>
                  {o.status}
                </span>
              </div>

              <div className="mt-2 text-sm text-slate-700">Total: <span className="font-semibold">EGP {o.total}</span></div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => openDetails(o.id)}>Details</button>
                {STATUSES.map((s) => (
                  <button key={s} className="rounded-lg border px-2 py-1 text-xs" onClick={() => changeStatus(o.id, s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {orders.length > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <button className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Order Details</h2>
          {!selected ? (
            <p className="text-sm text-slate-600">Select an order to view details.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {selected.id}</div>
              <div><strong>Status:</strong> {selected.status}</div>
              <div><strong>Payment:</strong> {selected.paymentMethod}</div>
              <div><strong>Total:</strong> EGP {selected.total}</div>
              <div><strong>Delivery Address:</strong> {selected.address}</div>
              <div><strong>Notes:</strong> {selected.notes || '-'}</div>
              <hr />
              <div><strong>Customer:</strong> {selected.user?.name || selected.user?.username || '-'}</div>
              <div><strong>Phone:</strong> {selected.user?.phone || '-'}</div>
              <div><strong>Customer Address:</strong> {selected.user?.address || '-'}</div>
              <div><strong>Customer Location:</strong> {selected.user?.location || '-'}</div>
              <hr />
              <div className="font-medium">Items</div>
              {selected.items.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-2">
                  <div>{item.product?.name || 'Product'}</div>
                  <div className="text-xs text-slate-600">Qty: {item.quantity} • Unit: EGP {item.unitPrice}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
