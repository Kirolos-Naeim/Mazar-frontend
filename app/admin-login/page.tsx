'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { getLang, type Lang } from '@/lib/i18n';
import { getClientRole, setClientSession } from '@/lib/session';
import { api } from '@/lib/api';

const labels = {
  en: {
    title: 'Admin Login',
    subtitle: 'Restricted access. Admin credentials required.',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in as Admin',
    invalid: 'Invalid credentials.',
  },
  ar: {
    title: 'دخول المدير',
    subtitle: 'وصول مقيّد. يلزم بيانات اعتماد المدير.',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    submit: 'الدخول كمدير',
    invalid: 'بيانات الاعتماد غير صحيحة.',
  },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getClientRole() !== 'GUEST') {
      router.push('/');
      return;
    }
    setLang(getLang());
  }, [router]);

  const t = labels[lang];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login-admin', {
        username: username.trim(),
        password,
      });
      const user = response.data.user;
      setClientSession({
        role: 'ADMIN',
        name: user?.username || username.trim(),
        userId: user?.id,
      });
      router.push('/admin');
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        alert(t.invalid);
      } else {
        alert('Could not login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-4 page-transition">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-white/80">{t.subtitle}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t.username}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.username}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">{t.password}</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="w-full rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
