import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://ais-pre-53thswuvdwvfsuri4fonim-432485439988.us-west2.run.app'),
  title: 'Barreto Cell | Gestão Financeira & Orçamentos',
  description: 'Controle de lucro, despesas, ordens de serviço e orçamentos em PDF com envio por WhatsApp para assistência técnica de celulares.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Barreto Cell',
  },
  icons: {
    icon: '/images/barreto_cell_logo.jpg',
    apple: '/images/barreto_cell_logo.jpg',
  },
  openGraph: {
    title: 'Barreto Cell | Gestão Financeira & Orçamentos',
    description: 'Sistema completo para assistência técnica de celular: lucro, despesas, ordens de serviço e orçamentos via WhatsApp.',
    type: 'website',
    images: ['/images/barreto_cell_logo.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barreto Cell | Gestão Financeira & Orçamentos',
    description: 'Sistema completo para assistência técnica de celular: lucro, despesas, ordens de serviço e orçamentos via WhatsApp.',
    images: ['/images/barreto_cell_logo.jpg'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
