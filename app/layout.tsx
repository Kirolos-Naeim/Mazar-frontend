import './globals.css';
import Nav from './nav';
import { ThemeProvider } from '@/lib/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-40 backdrop-blur-sm">
            <Nav />
          </header>
          <main className="mx-auto max-w-5xl p-3 sm:p-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
