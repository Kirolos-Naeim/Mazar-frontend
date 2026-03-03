export type CartItem = {
  productId: string;
  quantity: number;
  /** Stored at add-time so cart page doesn't need to re-fetch /products */
  name?: string;
  price?: string;
};

const CART_KEY = 'mvp-cart-items';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return parsed.filter((i) => i.productId && i.quantity > 0);
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(productId: string, quantity = 1, meta?: { name?: string; price?: string }) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    // Keep meta up to date in case price changed
    if (meta?.name) existing.name = meta.name;
    if (meta?.price) existing.price = meta.price;
  } else {
    cart.push({ productId, quantity, ...meta });
  }
  saveCart(cart);
}

export function updateCartItem(productId: string, quantity: number) {
  const cart = getCart()
    .map((i) => (i.productId === productId ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  saveCart(cart);
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}
