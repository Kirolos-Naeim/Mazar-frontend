'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { getLang, type Lang } from '@/lib/i18n';
import { getClientRole, setClientSession } from '@/lib/session';
import { api } from '@/lib/api';

const labels = {
  en: {
    title: 'Welcome back',
    subtitle: 'Login with username and password.',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in',
    noAccount: "Don't have an account?",
    register: 'Create one',
    adminLogin: 'Admin login',
    invalid: 'Invalid username or password.',
  },
  ar: {
    title: 'مرحباً بعودتك',
    subtitle: 'الدخول باسم المستخدم وكلمة المرور.',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    submit: 'دخول',
    noAccount: 'ليس لديك حساب؟',
    register: 'إنشاء حساب',
    adminLogin: 'دخول المدير',
    invalid: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

    try {
      const response = await api.post('/auth/login-customer', {
        username: username.trim(),
        password,
      });
      const user = response.data.user;
      setClientSession({
        role: 'CUSTOMER',
        name: user?.username || username.trim(),
        userId: user?.id,
      });
      router.push('/');
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        alert(t.invalid);
        return;
      }
      alert('Could not login. Please try again.');
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 page-transition">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-white/85">{t.subtitle}</p>
        <div className="mt-8 space-y-2 text-sm text-white/80">
          <div>• Fast checkout</div>
          <div>• Track your orders</div>
          <div>• Save delivery details</div>
        </div>
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
              required
            />
          </div>

          <button className="w-full rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
            {t.submit}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          <p>
            {t.noAccount} <a href="/register" className="font-medium text-slate-900 underline">{t.register}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
