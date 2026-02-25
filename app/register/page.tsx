'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { getLang, type Lang } from '@/lib/i18n';
import { getClientRole, setClientSession } from '@/lib/session';
import { api } from '@/lib/api';

const labels = {
  en: {
    title: 'Create your account',
    subtitle: 'Join MAZAR in less than a minute.',
    username: 'Username',
    password: 'Password',
    phone: 'Phone number',
    address: 'Address',
    location: 'Location (City/Area)',
    submit: 'Create account',
    haveAccount: 'Already have an account?',
    login: 'Login',
    invalidPhone: 'Please enter a valid phone number.',
    weakPassword: 'Password must be at least 6 characters.',
    existsPhone: 'This phone is already registered.',
    existsUsername: 'This username is already taken.',
  },
  ar: {
    title: 'أنشئ حسابك',
    subtitle: 'انضم إلى MAZAR خلال أقل من دقيقة.',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    phone: 'رقم الهاتف',
    address: 'العنوان',
    location: 'الموقع (المدينة/المنطقة)',
    submit: 'إنشاء الحساب',
    haveAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    invalidPhone: 'من فضلك أدخل رقم هاتف صحيح.',
    weakPassword: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
    existsPhone: 'هذا الرقم مسجل بالفعل.',
    existsUsername: 'اسم المستخدم مستخدم بالفعل.',
  },
};

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');

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

    if (!PHONE_REGEX.test(phone.trim())) {
      alert(t.invalidPhone);
      return;
    }

    if (password.length < 6) {
      alert(t.weakPassword);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        username: username.trim(),
        password,
        phone: phone.trim(),
        address: address.trim(),
        location: location.trim(),
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
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 409) {
        const msg = axiosError.response.data?.message || '';
        if (msg.toLowerCase().includes('username')) alert(t.existsUsername);
        else alert(t.existsPhone);
        return;
      }
      alert('Could not register. Please try again.');
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 page-transition">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-white/85">{t.subtitle}</p>
        <div className="mt-8 space-y-2 text-sm text-white/80">
          <div>• Personal account for faster checkout</div>
          <div>• Save your location and address</div>
          <div>• Follow order status anytime</div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.username}
            required
          />
          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phone}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t.address}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.location}
            required
          />

          <button className="w-full rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
            {t.submit}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          {t.haveAccount} <a href="/login" className="font-medium text-slate-900 underline">{t.login}</a>
        </p>
      </div>
    </div>
  );
}
