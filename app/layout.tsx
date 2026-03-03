import './globals.css';
import Nav from './nav';
import { ThemeProvider } from '@/lib/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          FOUC fix: apply dark class synchronously before React hydrates.
          Without this, ThemeProvider's useEffect runs too late and users
          see a flash of the wrong theme on every page load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      {/*
        Removed: transition-colors duration-300 — causes every DOM element to animate
        on theme switch. Also removed backdrop-blur-sm from sticky header below —
        it triggers a GPU filter repaint on every scroll frame on old phones.
      */}
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
            <Nav />
          </header>
          <main className="mx-auto max-w-5xl p-3 sm:p-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
