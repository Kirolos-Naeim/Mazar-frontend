'use client';

import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { addToCart, getCart, updateCartItem } from '@/lib/cart';

type Product = { id: string; name: string; category?: string; description?: string; imageUrl?: string; price: string; stock: number };
const PER_PAGE = 9;

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    api.get('/products').then((r) => {
      setProducts(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    const cartMap = Object.fromEntries(getCart().map((i) => [i.productId, i.quantity]));
    setCartQty(cartMap);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct]);

  const search = (searchParams.get('q') || '').trim().toLowerCase();

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))], [products]);

  const filteredProducts = useMemo(() => {
    const bySearch = !search
      ? products
      : products.filter((p) => `${p.name} ${p.category || ''} ${p.description || ''}`.toLowerCase().includes(search));

    if (selectedCategory === 'All') return bySearch;
    return bySearch.filter((p) => p.category === selectedCategory);
  }, [products, search, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, products.length]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const pagedProducts = filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const onIncrease = (productId: string) => {
    addToCart(productId, 1);
    setCartQty((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const onDecrease = (productId: string) => {
    const nextQty = Math.max(0, (cartQty[productId] || 0) - 1);
    updateCartItem(productId, nextQty);
    setCartQty((prev) => ({ ...prev, [productId]: nextQty }));
  };

  return (
    <div className="space-y-4 page-transition">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="mt-1 text-sm text-white/80">Discover meals you love and add them to your cart in one tap.</p>
      </div>

      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              className={c === selectedCategory ? 'rounded-full bg-black px-3 py-1 text-xs text-white' : 'rounded-full border px-3 py-1 text-xs text-slate-700'}
              onClick={() => startTransition(() => setSelectedCategory(c))}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="h-44 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-5 w-3/4 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-3 w-2/3 animate-pulse rounded-xl bg-slate-200" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-16 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
          {pagedProducts.map((p, index) => (
            <div
              key={p.id}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md card-animate"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedProduct(p)}
            >
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="mb-3 h-44 w-full rounded-xl object-cover" loading="lazy" />
              ) : null}
              <div className="mb-1 text-lg font-semibold text-slate-900">{p.name}</div>
              {p.category ? (
                <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{p.category}</span>
              ) : null}
              <div className="line-clamp-2 text-sm text-slate-600">{p.description}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">EGP {p.price}</div>
                {(cartQty[p.id] || 0) > 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border px-2 py-1" onClick={(e) => e.stopPropagation()}>
                    <button className="rounded px-2 text-sm" onClick={() => onDecrease(p.id)}>-</button>
                    <span className="min-w-5 text-center text-sm font-medium">{cartQty[p.id]}</span>
                    <button className="rounded px-2 text-sm" onClick={() => onIncrease(p.id)}>+</button>
                  </div>
                ) : (
                  <button
                    className="rounded-xl bg-black px-3 py-1.5 text-sm text-white transition hover:bg-slate-800"
                    onClick={(e) => { e.stopPropagation(); onIncrease(p.id); }}
                  >
                    Add to cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length > 0 ? (
        <div className="flex items-center justify-center gap-2">
          <button className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      ) : null}

      {!loading && filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No products found.
        </div>
      ) : null}

      {/* Product Detail Modal */}
      {selectedProduct && typeof document !== 'undefined'
        ? createPortal(
          <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm modal-backdrop"
              onClick={() => setSelectedProduct(null)}
            />

            {/* Content Wrapper */}
            <div className="pointer-events-none absolute inset-0 flex flex-col sm:items-center sm:justify-center sm:p-4">
              <div
                className="pointer-events-auto relative mt-auto sm:mt-0 w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl sm:max-w-lg border border-slate-200 bg-white shadow-xl modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile drag handle */}
                <div className="sticky top-0 z-10 flex justify-center pt-2.5 pb-1 sm:hidden bg-white rounded-t-3xl">
                  <div className="h-1 w-10 rounded-full bg-slate-300" />
                </div>

                <button
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Close"
                >
                  ✕
                </button>

                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-56 w-full object-cover sm:h-64" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400">No image</div>
                )}

                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h2>
                    {selectedProduct.category ? (
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{selectedProduct.category}</span>
                    ) : null}
                  </div>

                  {selectedProduct.description ? (
                    <p className="text-sm leading-relaxed text-slate-600">{selectedProduct.description}</p>
                  ) : (
                    <p className="text-sm italic text-slate-400">No description available.</p>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div>
                      <div className="text-lg font-bold text-slate-900">EGP {selectedProduct.price}</div>
                    </div>

                    {(cartQty[selectedProduct.id] || 0) > 0 ? (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
                        <button className="rounded px-2 text-base font-medium" onClick={() => onDecrease(selectedProduct.id)}>−</button>
                        <span className="min-w-6 text-center text-sm font-semibold">{cartQty[selectedProduct.id]}</span>
                        <button className="rounded px-2 text-base font-medium" onClick={() => onIncrease(selectedProduct.id)}>+</button>
                      </div>
                    ) : (
                      <button
                        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        onClick={() => onIncrease(selectedProduct.id)}
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
