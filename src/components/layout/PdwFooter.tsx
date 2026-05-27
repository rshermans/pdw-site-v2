"use client";

import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { useState, useEffect } from "react";

interface PdwFooterProps {
  lang: Locale;
  dict: any;
}

export function PdwFooter({ lang, dict }: PdwFooterProps) {
  const [currentYear] = useState(() => new Date().getFullYear());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footer = document.getElementById("pdw-footer");
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const project = {
    name: "Blockchain.PT",
    url: "https://blockchain.pt/",
    image: "/logo-Blockchain-pt.png",
  };

  const promotor = {
    name: "TecMinho",
    url: "https://www.tecminho.uminho.pt/",
    image: "/tcminho-logo.png",
  };

  const quickLinks = [
    { href: `/${lang}/sobre`, label: dict.nav.about },
    { href: `/${lang}/solucao`, label: dict.nav.solution },
    { href: `/${lang}/casos-de-uso`, label: dict.nav.useCases },
    { href: `/${lang}/contactos`, label: dict.nav.contacts },
  ];

  return (
    <footer
      id="pdw-footer"
      className={`footer-disruptive ${isVisible ? "footer-visible" : ""}`}
    >
      {/* Animated background elements */}
      <div className="footer-bg-grid" aria-hidden="true">
        <div className="footer-glow footer-glow-1" />
        <div className="footer-glow footer-glow-2" />
      </div>

      <div className="container">
        {/* Top divider with gradient */}
        <div className="footer-divider" />

        {/* Main footer grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Info */}
          <div className="footer-col footer-brand-col">
            <Link href={`/${lang}`} className="footer-brand-link">
              <Image
                src="/pdw_logo.png"
                alt="PDW Logo"
                width={36}
                height={36}
                className="footer-brand-logo"
              />
              <span className="footer-brand-name">
                Portuguese Digital Wallet
              </span>
            </Link>
            <p className="footer-description">
              {lang === "pt"
                ? "Infraestrutura crítica de confiança para a economia descentralizada portuguesa."
                : "Critical trust infrastructure for the Portuguese decentralized economy."}
            </p>
            <div className="footer-contact-info">
              <div className="footer-info-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{dict.footer.address}</span>
              </div>
              <div className="footer-info-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href={`mailto:${dict.footer.email}`}
                  className="footer-email-link"
                >
                  {dict.footer.email}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="footer-social-links" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <a href="https://www.linkedin.com/company/portuguese-digitalwallet/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: 'var(--color-muted)', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0A66C2'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="https://chat.whatsapp.com/JyjCwcWsNNe5w4oP4QEvZW" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Community" style={{ color: 'var(--color-muted)', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#25D366'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </a>
              <a href="https://www.instagram.com/pwdwallet.pt" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--color-muted)', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E1306C'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-muted)'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col footer-links-col">
            <h3 className="footer-col-title">
              {lang === "pt" ? "Navegação" : "Navigation"}
            </h3>
            <nav className="footer-nav" aria-label={lang === "pt" ? "Navegação do rodapé" : "Footer navigation"}>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-nav-link"
                >
                  <span className="footer-link-arrow">→</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Partners with grayscale → color effect */}
          <div className="footer-col footer-partners-col">
            {/* O Projeto */}
            <h3 className="footer-col-title">
              {lang === "pt" ? "O Projeto" : "The Project"}
            </h3>
            <div className="footer-partners-grid" style={{ marginBottom: 20 }}>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-partner-card"
                title={`${lang === "pt" ? "Visitar" : "Visit"} ${project.name}`}
              >
                <div className="partner-image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.image} alt={project.name} className="partner-logo-img" />
                </div>
              </a>
            </div>

            {/* Promotor */}
            <h3 className="footer-col-title">
              {lang === "pt" ? "Promotor" : "Promoter"}
            </h3>
            <div className="footer-partners-grid">
              <a
                href={promotor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-partner-card"
                title={`${lang === "pt" ? "Visitar" : "Visit"} ${promotor.name}`}
              >
                <div className="partner-image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={promotor.image} alt={promotor.name} className="partner-logo-img" />
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Funders section */}
        <div className="footer-funders">
          <div className="footer-funders-label">
            {lang === "pt" ? "Financiado por" : "Funded by"}
          </div>
          <div className="footer-funders-logos">
            <div className="funder-logo-wrapper">
              <Image src="/PRR.png" alt="PRR" fill sizes="(max-width: 768px) 120px, 160px" className="funders-img" />
            </div>
            <div className="funder-logo-wrapper">
              <Image src="/RP.png" alt="República Portuguesa" fill sizes="(max-width: 768px) 120px, 160px" className="funders-img" />
            </div>
            <div className="funder-logo-wrapper">
              <Image src="/FEU.png" alt="União Europeia" fill sizes="(max-width: 768px) 120px, 160px" className="funders-img" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Portuguese Digital Wallet.{" "}
            {lang === "pt"
              ? "Financiado por PRR & NextGenerationEU."
              : "Funded by PRR & NextGenerationEU."}
          </p>
          <div className="footer-legal-links">
            <Link href={`/${lang}/privacidade`} className="footer-legal-link">
              {lang === "pt" ? "Política de Privacidade" : "Privacy Policy"}
            </Link>
            <span className="footer-legal-sep">·</span>
            <Link href={`/${lang}/termos`} className="footer-legal-link">
              {lang === "pt" ? "Termos de Utilização" : "Terms of Use"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
