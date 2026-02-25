'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getClientSession, logoutToGuest, type ClientSession } from '@/lib/session';
import { getLang, toggleLang, type Lang } from '@/lib/i18n';
import { getCart } from '@/lib/cart';
import { useTheme } from '@/lib/theme';

const labels = {
  en: {
    home: 'Home',
    products: 'Products',
    orders: 'My Orders',
    adminDashboard: 'Dashboard',
    admin: 'Inventory',
    adminOrders: 'Orders',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    guest: 'Guest',
    search: 'Search products...',
    switchLang: 'العربية',
  },
  ar: {
    home: 'الرئيسية',
    products: 'المنتجات',
    orders: 'طلباتي',
    adminDashboard: 'لوحة التحكم',
    admin: 'المخزون',
    adminOrders: 'الطلبات',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    guest: 'زائر',
    search: 'ابحث عن المنتجات...',
    switchLang: 'English',
  },
};

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<ClientSession>({ role: 'GUEST', name: 'Guest' });
  const [lang, setLangState] = useState<Lang>('en');
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    setSession(getClientSession());
    setLangState(getLang());

    const q = new URLSearchParams(window.location.search).get('q') || '';
    setSearch(q);

    const updateCartCount = () => {
      const count = getCart().reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, [pathname]);

  const t = labels[lang];

  const navItemClass = (href: string, exact = false) => {
    const isActive = exact ? pathname === href : href === '/' ? pathname === '/' : pathname?.startsWith(href);
    return isActive
      ? 'whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 font-semibold text-white dark:bg-white dark:text-slate-900'
      : 'whitespace-nowrap rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800';
  };

  const authButtonClass = (href: string) =>
    pathname?.startsWith(href)
      ? 'rounded-xl bg-slate-900 px-3 py-1.5 font-semibold text-white dark:bg-white dark:text-slate-900'
      : 'rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700';

  const displayName = session.role === 'GUEST' ? t.guest : session.name;

  const onSearchChange = (value: string) => {
    setSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = value.trim();
      const target = q ? `/products?q=${encodeURIComponent(q)}` : '/products';
      router.replace(target);
    }, 220);
  };

  return (
    <nav className="mx-auto w-full max-w-6xl p-3 sm:p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-3.5 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="relative z-10 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-base font-extrabold tracking-[0.18em] text-transparent">
            MAZAR
          </span>
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_40%)]" aria-hidden="true" />
        </Link>

        <div className="order-3 w-full md:order-none md:w-auto md:flex-1">
          {session.role !== 'ADMIN' ? (
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
              placeholder={t.search}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {session.role !== 'ADMIN' ? (
            <Link
              href="/cart"
              className="group relative rounded-xl border border-slate-900 bg-gradient-to-b from-slate-900 to-black px-3 py-1.5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              aria-label="Cart"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                className="h-5 w-5 drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]"
                aria-hidden="true"
              >
                <path d="M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4" strokeLinecap="round" />
                <path d="M4 8h16l-1.6 11a2 2 0 0 1-2 1.7H7.6a2 2 0 0 1-2-1.7L4 8z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12.2l1.5 1.5L14.8 9.4" strokeLinecap="round" strokeLinejoin="round" className="opacity-90" />
              </svg>
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white/80" />
              ) : null}
            </Link>
          ) : null}

          <span className="hidden sm:inline rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">{displayName}</span>
          <button
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            onClick={() => setLangState((current) => toggleLang(current))}
          >
            {t.switchLang}
          </button>

          {/* Dark / light toggle */}
          <button
            aria-label="Toggle theme"
            className="rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              // Sun icon
              <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0ZM12 1a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1Zm0 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM3.22 4.64a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.41 1.42l-.71-.71a1 1 0 0 1 0-1.41Zm14.12 14.12a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41ZM1 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1Zm19 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM4.64 19.78a1 1 0 0 1 0-1.41l.7-.71a1 1 0 0 1 1.42 1.41l-.71.71a1 1 0 0 1-1.41 0ZM17.66 6.7a1 1 0 0 1 0-1.41l.71-.7a1 1 0 0 1 1.41 1.4l-.71.71a1 1 0 0 1-1.41 0Z" /></svg>
            ) : (
              // Moon icon
              <svg className="h-4 w-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24"><path d="M21.75 15A9.75 9.75 0 0 1 9 2.25 9.75 9.75 0 1 0 21.75 15Z" /></svg>
            )}
          </button>

          {session.role === 'GUEST' ? (
            <>
              <Link href="/register" className={authButtonClass('/register')}>
                {t.register}
              </Link>
              <Link href="/login" className={authButtonClass('/login')}>
                {t.login}
              </Link>
            </>
          ) : (
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              onClick={() => {
                logoutToGuest();
                window.location.href = '/';
              }}
            >
              {t.logout}
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex min-w-max items-center gap-1 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-1">
          {session.role === 'ADMIN' ? (
            <>
              <Link href="/admin/dashboard" className={navItemClass('/admin/dashboard')}>
                {t.adminDashboard}
              </Link>
              <Link href="/admin" className={navItemClass('/admin', true)}>
                {t.admin}
              </Link>
              <Link href="/admin/orders" className={navItemClass('/admin/orders')}>
                {t.adminOrders}
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className={navItemClass('/')}>
                {t.home}
              </Link>
              <Link href="/products" className={navItemClass('/products')}>
                {t.products}
              </Link>
              <Link href="/orders" className={navItemClass('/orders')}>
                {t.orders}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
