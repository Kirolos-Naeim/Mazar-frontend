'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    title: 'Welcome to MAZAR',
    subtitle: 'Fresh meals delivered fast across your area.',
    image: '/products/image.png',
  },
  {
    title: 'Daily Favorites',
    subtitle: 'Shawarma, Koshari, Molokhia and more.',
    image: '/products/shawarma.png',
  },
  {
    title: 'Easy Checkout',
    subtitle: 'Cash on delivery — simple and fast.',
    image: '/products/molokhia.png',
  },
];

const highlights = [
  { title: 'Fast Delivery', note: 'Average 30-45 min in supported areas' },
  { title: 'Secure Checkout', note: 'Cash on Delivery' },
  { title: 'Fresh Daily', note: 'Prepared by partner kitchens every day' },
];

export default function HomePage() {
  const [index, setIndex] = useState(0);

  // Preload all slider images on mount to prevent flash on slide change
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const current = slides[index];

  return (
    <div className="space-y-6 page-transition">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm soft-hover">
        <img
          key={current.image}
          src={current.image}
          alt={current.title}
          className="h-[430px] w-full object-cover slide-fade-in"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/20" />

        <div className="absolute inset-0 flex items-center justify-start p-8 md:p-12">
          <div key={index} className="max-w-xl space-y-3 text-white slide-fade-in">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">{current.title}</h1>
            <p className="text-sm text-white/90 md:text-base">{current.subtitle}</p>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={i === index
                ? 'h-2.5 w-8 rounded-full bg-white transition-all duration-300'
                : 'h-2.5 w-2.5 rounded-full bg-white/50 transition-all duration-300'}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-base font-semibold text-slate-900">{item.title}</div>
            <div className="mt-1 text-sm text-slate-600">{item.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
