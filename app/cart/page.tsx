'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { api, currentAuthHeaders } from '@/lib/api';
import { clearCart, getCart, updateCartItem } from '@/lib/cart';
import { getClientRole } from '@/lib/session';

type CartLine = {
  productId: string;
  name: string;
  price: string;
  quantity: number;
};

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

type Status = { type: 'success' | 'error'; message: string } | null;

export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [address, setAddress] = useState('Cairo, Egypt');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    // Read name+price from localStorage cart items — no API fetch needed.
    // ProductCard stores them at add-time via the updated addToCart().
    const items = getCart();
    setCart(
      items
        .filter((i) => i.name && i.price) // items added before this update may lack meta
        .map((i) => ({ productId: i.productId, name: i.name!, price: i.price!, quantity: i.quantity })),
    );
    setIsGuest(getClientRole() === 'GUEST');
  }, []);

  const total = useMemo(
    () => cart.reduce((acc, l) => acc + Number(l.price) * l.quantity, 0),
    [cart],
  );

  const setQty = (productId: string, qty: number) => {
    updateCartItem(productId, qty);
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)),
    );
  };

  const confirmOrder = async () => {
    if (!cart.length) {
      setStatus({ type: 'error', message: 'Your cart is empty.' });
      return;
    }

    const payload = {
      items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      paymentMethod: 'COD' as const,
      address,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    setStatus(null);

    try {
      if (isGuest) {
        if (!phone.trim() || !PHONE_REGEX.test(phone.trim())) {
          setStatus({ type: 'error', message: 'Please enter a valid phone number (e.g. +201001234567).' });
          setSubmitting(false);
          return;
        }
        await api.post('/guest/orders', { ...payload, phone: phone.trim() });
      } else {
        const headers = currentAuthHeaders();
        if (!headers) {
          setStatus({ type: 'error', message: 'Session expired. Please log in again.' });
          setSubmitting(false);
          return;
        }
        await api.post('/orders', payload, { headers });
      }

      clearCart();
      setCart([]);
      setStatus({ type: 'success', message: '✓ Order confirmed! We\'ll deliver soon.' });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Confirm order failed', axiosError.response?.data || axiosError.message);
      setStatus({ type: 'error', message: 'Could not confirm order. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 page-transition">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <p className="mt-1 text-sm text-white/80">Review your items and confirm your order in seconds.</p>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          {status?.type === 'success' ? (
            <p className="font-medium text-emerald-600">{status.message}</p>
          ) : (
            'Your cart is empty.'
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Cart lines */}
          <div className="space-y-3 lg:col-span-2">
            {cart.map((line) => (
              <div
                key={line.productId}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{line.name}</div>
                    <div className="text-sm text-slate-600">EGP {line.price}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    EGP {(Number(line.price) * line.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="rounded-lg border px-2.5 py-1 text-sm"
                    onClick={() => setQty(line.productId, line.quantity - 1)}
                    aria-label="Remove one"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium">{line.quantity}</span>
                  <button
                    className="rounded-lg border px-2.5 py-1 text-sm"
                    onClick={() => setQty(line.productId, line.quantity + 1)}
                    aria-label="Add one"
                  >
                    +
                  </button>
                  <button
                    className="ml-2 rounded-lg border px-2.5 py-1 text-xs text-rose-600 transition hover:bg-rose-50"
                    onClick={() => setQty(line.productId, 0)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-base font-semibold">Checkout</div>

            <label className="mb-1 block text-xs text-slate-600">Delivery Address</label>
            <input
              className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="font-medium">Payment:</span> Cash on Delivery
            </div>

            <label className="mb-1 block text-xs text-slate-600">Note (optional)</label>
            <textarea
              className="mb-3 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              rows={2}
              placeholder="E.g. no onions, ring the bell twice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {isGuest ? (
              <>
                <label className="mb-1 block text-xs text-slate-600">Phone (required for guest checkout)</label>
                <input
                  className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder="+201001234567"
                  value={phone}
                  type="tel"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            ) : null}

            <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold">
              Total: EGP {total.toFixed(2)}
            </div>

            {/* Inline status — replaces alert() and window.prompt() */}
            {status ? (
              <div
                className={`mb-3 rounded-xl px-3 py-2 text-sm ${status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
                  }`}
              >
                {status.message}
              </div>
            ) : null}

            <button
              className="w-full rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 transition hover:bg-slate-800"
              onClick={confirmOrder}
              disabled={submitting}
            >
              {submitting ? 'Confirming...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
