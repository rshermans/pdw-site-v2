import { getDictionary } from '@/i18n/dictionaries';
import { Locale, locales } from '@/i18n/config';
import { PdwHeader } from '@/components/layout/PdwHeader';
import { PdwFooter } from '@/components/layout/PdwFooter';
import { GoogleAnalytics } from '@/components/ui/GoogleAnalytics';
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget';
import type { Metadata } from 'next';
import "../globals.css";
import "../accessibility.css";

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isPt = lang === 'pt';
  
  return {
    metadataBase: new URL('https://pdw.tecminho.uminho.pt'),
    title: {
      template: isPt ? '%s | Portuguese Digital Wallet' : '%s | Portuguese Digital Wallet',
      default: isPt ? 'Portuguese Digital Wallet — Acesso Digital Sem Fricção' : 'Portuguese Digital Wallet — Frictionless Digital Access',
    },
    description: isPt
      ? 'A PDW é a carteira digital soberana de Portugal. Credenciais verificáveis, eIDAS 2.0, EBSI.'
      : 'PDW is Portugal\'s sovereign digital wallet. Verifiable credentials, eIDAS 2.0, EBSI.',
    openGraph: {
      type: 'website',
      locale: isPt ? 'pt_PT' : 'en_GB',
      url: 'https://pdw.tecminho.uminho.pt',
      siteName: 'Portuguese Digital Wallet',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} dir="ltr">
      <body>
        <GoogleAnalytics />
        <PdwHeader lang={lang as Locale} dict={dict} />
        <main className="main pt-24 pb-12">
          <div className="container">
            {children}
          </div>
        </main>
        <PdwFooter lang={lang as Locale} dict={dict} />
        <AccessibilityWidget lang={lang} />
      </body>
    </html>
  );
}
