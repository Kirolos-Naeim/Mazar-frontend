export type Lang = 'en' | 'ar';

const LANG_KEY = 'mvp-lang';

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const value = localStorage.getItem(LANG_KEY);
  return value === 'ar' ? 'ar' : 'en';
}

export function setLang(lang: Lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
}

export function toggleLang(current: Lang): Lang {
  const next = current === 'en' ? 'ar' : 'en';
  setLang(next);
  return next;
}
