'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { api, currentAuthHeaders } from '@/lib/api';
import { clearCart, getCart, updateCartItem } from '@/lib/cart';
import { getClientRole } from '@/lib/session';

type Product = { id: string; name: string; price: string; stock: number };
type CartLine = { product: Product; quantity: number };

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export default function CartPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [address, setAddress] = useState('Cairo, Egypt');
  const [notes, setNotes] = useState('');

  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data));
    setCart(getCart());
    setIsGuest(getClientRole() === 'GUEST');
  }, []);

  const lines = useMemo<CartLine[]>(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return cart
      .map((item) => {
        const product = map.get(item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter((x): x is CartLine => Boolean(x));
  }, [products, cart]);

  const total = useMemo(() => lines.reduce((acc, l) => acc + Number(l.product.price) * l.quantity, 0), [lines]);

  const setQty = (productId: string, qty: number) => {
    updateCartItem(productId, qty);
    setCart(getCart());
  };

  const confirmOrder = async () => {
    if (!lines.length) {
      alert('Your cart is empty');
      return;
    }

    const payload = {
      items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      paymentMethod: 'COD' as const,
      address,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (phone.trim()) {
        if (!PHONE_REGEX.test(phone.trim())) {
          alert('Please enter a valid phone number.');
          return;
        }
        await api.post('/guest/orders', { ...payload, phone: phone.trim() });
      } else {
        const headers = currentAuthHeaders();

        if (!headers) {
          const inputPhone = window.prompt('Enter phone number to confirm as guest (e.g. +201001234567):');
          if (!inputPhone) return;
          const normalizedPhone = inputPhone.trim();
          if (!PHONE_REGEX.test(normalizedPhone)) {
            alert('Please enter a valid phone number.');
            return;
          }
          await api.post('/guest/orders', { ...payload, phone: normalizedPhone });
        } else {
          await api.post('/orders', payload, { headers });
        }
      }

      clearCart();
      setCart([]);
      alert('Order confirmed');
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Confirm order failed', axiosError.response?.data || axiosError.message);
      alert('Could not confirm order.');
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

      {lines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">Your cart is empty.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {lines.map((line, index) => (
              <div
                key={line.product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm soft-hover card-animate"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{line.product.name}</div>
                    <div className="text-sm text-slate-600">EGP {line.product.price}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button className="rounded-lg border px-2.5 py-1" onClick={() => setQty(line.product.id, line.quantity - 1)}>
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium">{line.quantity}</span>
                  <button className="rounded-lg border px-2.5 py-1" onClick={() => setQty(line.product.id, line.quantity + 1)}>
                    +
                  </button>
                  <button className="ml-2 rounded-lg border px-2.5 py-1 text-xs text-red-600" onClick={() => setQty(line.product.id, 0)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm soft-hover card-animate" style={{ animationDelay: `${lines.length * 55}ms` }}>
            <div className="mb-3 text-base font-semibold">Checkout</div>

            <label className="mb-1 block text-xs text-slate-600">Address</label>
            <input
              className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="font-medium">Payment:</span> Cash on Delivery
            </div>

            <label className="mb-1 block text-xs text-slate-600">Note (optional)</label>
            <textarea
              className="mb-3 w-full rounded-xl border px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="E.g. no onions, ring the bell twice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {isGuest ? (
              <>
                <label className="mb-1 block text-xs text-slate-600">Phone (required for guest checkout)</label>
                <input
                  className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="+201001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            ) : null}

            <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold">Total: EGP {total.toFixed(2)}</div>
            <button
              className="w-full rounded-xl bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
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
