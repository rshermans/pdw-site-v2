"use client";

import Image from "next/image";

interface TrustBarProps {
  dict: any;
}

interface PartnerInfo {
  logo: string;
  url: string;
  imgClass?: string;
}

export function TrustBar({ dict }: TrustBarProps) {
  const partnerData: Record<string, PartnerInfo> = {
    "Universidade do Minho": { logo: "/uminho_logo.png", url: "https://www.uminho.pt/PT" },
    "University of Minho": { logo: "/uminho_logo.png", url: "https://www.uminho.pt/PT" },
    "TecMinho": { logo: "/tcminho-logo.png", url: "https://www.tecminho.uminho.pt/" },
    "VOID Software": { logo: "/logo-void.png", url: "https://void.software/" },
    "EBSI": { logo: "/logo-ebsi.png", url: "https://hub.ebsi.eu/", imgClass: "trust-logo-img--boosted" },
  };

  return (
    <section
      className="section-card trust-bar-section"
      aria-labelledby="trustbar-title"
      style={{
        marginTop: 14,
        border: '1px solid rgba(0, 108, 75, 0.1)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      <strong id="trustbar-title" className="trust-bar-label">
        {dict.trustBar.title}
      </strong>
      <div className="trust-bar-logos">
        {dict.trustBar.partners.map((item: string) => {
          const partner = partnerData[item];

          if (partner) {
            return (
              <a
                key={item}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                title={item}
                className="trust-logo-link"
                style={{ width: '130px', height: '46px' }}
              >
                <Image
                  src={partner.logo}
                  alt={item}
                  fill
                  sizes="130px"
                  className={`trust-logo-img${partner.imgClass ? ` ${partner.imgClass}` : ''}`}
                  style={{ objectFit: 'contain' }}
                />
              </a>
            );
          }

          return (
            <span key={item} className="trust-logo-text">
              {item}
            </span>
          );
        })}
      </div>
    </section>
  );
}
