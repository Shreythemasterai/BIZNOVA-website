import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'BizNova — New Balaji Trading Company, Moshi, Pune',
  description:
    'AI-powered hyperlocal grocery and daily essentials e-commerce platform for New Balaji Trading Company, Tupe Vasti, Moshi, Pune. Shop fresh groceries, staples, dairy, snacks with 15–25 minute quick delivery.',
  keywords: [
    'BizNova',
    'New Balaji Trading Company',
    'Moshi Pune Grocery Delivery',
    'Tupe Vasti Grocery Store',
    'Kirana Store Online Pune',
    'Quick Commerce Moshi',
    'AI Retail Advisor',
  ],
  authors: [{ name: 'BizNova & New Balaji Trading Co.' }],
  openGraph: {
    title: 'BizNova — New Balaji Trading Company, Moshi, Pune',
    description: 'Shop fresh groceries & daily-use products online with 15–25 minute hyperlocal delivery in Moshi, Pune.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

