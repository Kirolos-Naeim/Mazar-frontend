'use client';

import Image from 'next/image';
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
    subtitle: 'Cash on Delivery — simple and fast.',
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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 page-transition">
      {/*
        Hero slider: all images are always in the DOM, toggled via opacity.
        This avoids unmounting/remounting <img> on each slide change,
        which caused a flash and unnecessary network re-checks.
        next/image gives WebP/AVIF auto-format + no layout shift.
      */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm" style={{ height: 430 }}>
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 900px"
            />
          </div>
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/20 pointer-events-none" />

        {/* Text — fade-in keyed on index so text still animates on change */}
        <div className="absolute inset-0 flex items-center justify-start p-8 md:p-12">
          <div key={index} className="max-w-xl space-y-3 text-white slide-fade-in">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">{slides[index].title}</h1>
            <p className="text-sm text-white/90 md:text-base">{slides[index].subtitle}</p>
          </div>
        </div>

        {/* Dot controls */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? 'h-2.5 w-8 rounded-full bg-white transition-all duration-300'
                  : 'h-2.5 w-2.5 rounded-full bg-white/50 transition-all duration-300'
              }
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
