'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbProps {
  dict: any;
  lang: string;
}

export function Breadcrumb({ dict, lang }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Remove o locale do início do pathname para processamento
  const pathWithoutLocale = pathname.replace(`/${lang}`, '');
  
  if (!pathWithoutLocale || pathWithoutLocale === '/') {
    return null; // Não mostra na Home
  }

  const segments = pathWithoutLocale.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <Link 
        href={`/${lang}`}
        className="breadcrumb-link"
        aria-label={dict?.navigation?.home || "Home"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="breadcrumb-icon"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </Link>
      
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${lang}/${segments.slice(0, index + 1).join('/')}`;
        
        // Capitalize e formata o texto (ex: casos-de-uso -> Casos de uso)
        const text = segment
          .split('-')
          .map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
          .join(' ');

        return (
          <div key={href} className="breadcrumb-separator">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 4px' }}><path d="m9 18 6-6-6-6"/></svg>
            {isLast ? (
              <span className="breadcrumb-active" aria-current="page">
                {text}
              </span>
            ) : (
              <Link 
                href={href}
                className="breadcrumb-link"
              >
                {text}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
