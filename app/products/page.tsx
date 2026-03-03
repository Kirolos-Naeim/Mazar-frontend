'use client';

import { memo, Suspense, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { addToCart, getCart, updateCartItem } from '@/lib/cart';

type Product = {
  id: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  price: string;
  stock: number;
};

const PER_PAGE = 9;

// ─── ProductCard (memoised) ──────────────────────────────────────────────────
// Wrapped in React.memo so opening/closing the detail modal does not re-render
// the entire grid (which was the main source of jank when modal state lived in
// the parent).
const ProductCard = memo(function ProductCard({
  product: p,
  qty,
  onIncrease,
  onDecrease,
  onOpen,
}: {
  product: Product;
  qty: number;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onOpen: (p: Product) => void;
}) {
  return (
    <div
      className="card-animate cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm soft-hover"
      onClick={() => onOpen(p)}
    >
      {p.imageUrl ? (
        <div className="relative mb-3 h-44 w-full overflow-hidden rounded-xl">
          <Image
            src={p.imageUrl}
            alt={p.name}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={p.imageUrl.startsWith('http')}
          />
        </div>
      ) : null}
      <div className="mb-1 text-lg font-semibold text-slate-900">{p.name}</div>
      {p.category ? (
        <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {p.category}
        </span>
      ) : null}
      <div className="line-clamp-2 text-sm text-slate-600">{p.description}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-base font-bold text-slate-900">EGP {p.price}</div>
        {qty > 0 ? (
          <div
            className="flex items-center gap-2 rounded-xl border px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="rounded px-2 text-sm font-semibold leading-none"
              aria-label="Remove one"
              onClick={() => onDecrease(p.id)}
            >
              −
            </button>
            <span className="min-w-5 text-center text-sm font-medium">{qty}</span>
            <button
              className="rounded px-2 text-sm font-semibold leading-none"
              aria-label="Add one"
              onClick={() => onIncrease(p.id)}
            >
              +
            </button>
          </div>
        ) : (
          <button
            className="rounded-xl bg-black px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              onIncrease(p.id);
            }}
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
});

// ─── ProductsContent ─────────────────────────────────────────────────────────
function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Track mount for createPortal
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get('/products', { signal: controller.signal })
      .then((r) => {
        setProducts(r.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== 'CanceledError') setLoading(false);
      });

    const cartMap = Object.fromEntries(getCart().map((i) => [i.productId, i.quantity]));
    setCartQty(cartMap);

    return () => controller.abort();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedProduct ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct]);

  const search = (searchParams.get('q') || '').trim().toLowerCase();

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const bySearch = !search
      ? products
      : products.filter((p) =>
        `${p.name} ${p.category || ''} ${p.description || ''}`.toLowerCase().includes(search),
      );
    return selectedCategory === 'All' ? bySearch : bySearch.filter((p) => p.category === selectedCategory);
  }, [products, search, selectedCategory]);

  useEffect(() => { setPage(1); }, [search, selectedCategory, products.length]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const pagedProducts = filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stable callbacks so ProductCard doesn't re-render on parent state changes
  const onIncrease = useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    addToCart(productId, 1, { name: product?.name, price: product?.price });
    setCartQty((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  }, [products]);

  const onDecrease = useCallback((productId: string) => {
    const nextQty = Math.max(0, (cartQty[productId] || 0) - 1);
    updateCartItem(productId, nextQty);
    setCartQty((prev) => ({ ...prev, [productId]: nextQty }));
  }, [cartQty]);

  const onOpen = useCallback((p: Product) => setSelectedProduct(p), []);

  return (
    <div className="space-y-4 page-transition">
      {/* Page header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="mt-1 text-sm text-white/80">Discover meals you love and add them to your cart in one tap.</p>
      </div>

      {/* Category filter */}
      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              className={
                c === selectedCategory
                  ? 'rounded-full bg-black px-3 py-1 text-xs font-medium text-white'
                  : 'rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100'
              }
              onClick={() => startTransition(() => setSelectedCategory(c))}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {/* Product grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="h-44 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-5 w-3/4 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-16 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${isPending ? 'opacity-60' : ''}`}
        >
          {pagedProducts.map((p) => (
            // No staggered animationDelay — avoids firing 9 simultaneous animations
            // on every category/search change which caused jank on low-end devices.
            <ProductCard
              key={p.id}
              product={p}
              qty={cartQty[p.id] || 0}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredProducts.length > PER_PAGE ? (
        <div className="flex items-center justify-center gap-2">
          <button
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      ) : null}

      {!loading && filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No products found.
        </div>
      ) : null}

      {/* Product Detail Modal */}
      {mounted && selectedProduct
        ? createPortal(
          <div className="fixed inset-0 z-[100]">
            {/* Backdrop — no backdrop-blur (too expensive on low-end GPU) */}
            <div
              className="absolute inset-0 bg-black/60 modal-backdrop"
              onClick={() => setSelectedProduct(null)}
            />

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
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900"
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Close"
                >
                  ✕
                </button>

                {selectedProduct.imageUrl ? (
                  <div className="relative h-56 w-full sm:h-64 overflow-hidden">
                    <Image
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 512px"
                      unoptimized={selectedProduct.imageUrl.startsWith('http')}
                    />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400">
                    No image
                  </div>
                )}

                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h2>
                    {selectedProduct.category ? (
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {selectedProduct.category}
                      </span>
                    ) : null}
                  </div>

                  {selectedProduct.description ? (
                    <p className="text-sm leading-relaxed text-slate-600">{selectedProduct.description}</p>
                  ) : (
                    <p className="text-sm italic text-slate-400">No description available.</p>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="text-lg font-bold text-slate-900">EGP {selectedProduct.price}</div>
                    {(cartQty[selectedProduct.id] || 0) > 0 ? (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
                        <button
                          className="rounded px-2 text-base font-medium"
                          onClick={() => onDecrease(selectedProduct.id)}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">
                          {cartQty[selectedProduct.id]}
                        </span>
                        <button
                          className="rounded px-2 text-base font-medium"
                          onClick={() => onIncrease(selectedProduct.id)}
                        >
                          +
                        </button>
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
          document.body,
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
