"use client";

import { useEffect, useState } from "react";

interface DownloadButtonsProps {
  dict: any;
  className?: string;
}

export function DownloadButtons({ dict, className = "" }: DownloadButtonsProps) {
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop" | null>(null);

  useEffect(() => {
    const userAgent = typeof window !== "undefined" ? navigator.userAgent || "" : "";
    const isAndroid = /android/i.test(userAgent);
    const isIos = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    if (isAndroid) {
      setPlatform("android");
    } else if (isIos) {
      setPlatform("ios");
    } else {
      setPlatform("desktop");
    }
  }, []);

  const playStoreUrl = "https://play.google.com/store/apps/details?id=pt.tecminho.pdw&pcampaignid=web_share";
  const appStoreUrl = "https://apps.apple.com/pt/app/portuguese-digital-wallet/id6758147577";

  const renderAndroidButton = () => (
    <a
      href={playStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="download-btn download-btn-android"
      aria-label="Download from Google Play Store"
      title="Google Play Store"
    >
      <svg className="download-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M17.523 15.3414C17.523 16.3725 16.6868 17.2087 15.6557 17.2087H13.6267V19.4674C13.6267 20.3204 12.9238 21.0182 12.0708 21.0182C11.2178 21.0182 10.5149 20.3204 10.5149 19.4674V17.2087H8.48588C7.45479 17.2087 6.61863 16.3725 6.61863 15.3414V9.65857C6.61863 8.62749 7.45479 7.79133 8.48588 7.79133H15.6557C16.6868 7.79133 17.523 8.62749 17.523 9.65857V15.3414ZM16.3267 6.63471H7.81491C7.81491 4.54224 9.20894 2.80287 11.233 2.18182L10.3541 0.771968C10.2225 0.560413 10.2882 0.281895 10.5009 0.150244C10.7125 0.0173774 10.991 0.0843118 11.1226 0.295867L12.062 1.80284L13.0015 0.295867C13.1331 0.0843118 13.4116 0.0173774 13.6232 0.150244C13.8359 0.281895 13.9016 0.560413 13.77 0.771968L12.8911 2.18182C14.9151 2.80287 16.3267 4.54224 16.3267 6.63471ZM5.52627 9.65857C5.52627 8.80556 4.82333 8.10775 3.97032 8.10775C3.11732 8.10775 2.41438 8.80556 2.41438 9.65857V14.1687C2.41438 15.0217 3.11732 15.7196 3.97032 15.7196C4.82333 15.7196 5.52627 15.0217 5.52627 14.1687V9.65857ZM21.7272 9.65857C21.7272 8.80556 21.0242 8.10775 20.1712 8.10775C19.3182 8.10775 18.6153 8.80556 18.6153 9.65857V14.1687C18.6153 15.0217 19.3182 15.7196 20.1712 15.7196C21.0242 15.7196 21.7272 15.0217 21.7272 14.1687V9.65857ZM10.2862 10.9705C10.2862 10.5147 9.91741 10.1458 9.46162 10.1458C9.00583 10.1458 8.63699 10.5147 8.63699 10.9705C8.63699 11.4263 9.00583 11.7952 9.46162 11.7952C9.91741 11.7952 10.2862 11.4263 10.2862 10.9705ZM15.5033 10.9705C15.5033 10.5147 15.1345 10.1458 14.6787 10.1458C14.2229 10.1458 13.8541 10.5147 13.8541 10.9705C13.8541 11.4263 14.2229 11.7952 14.6787 11.7952C15.1345 11.7952 15.5033 11.4263 15.5033 10.9705Z" />
      </svg>
      <span className="download-btn-text">{dict.nav.cta || "Obter a App"}</span>
    </a>
  );

  const renderIosButton = () => (
    <a
      href={appStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="download-btn download-btn-ios"
      aria-label="Download from Apple App Store"
      title="Apple App Store"
    >
      <svg className="download-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
      </svg>
      <span className="download-btn-text">{dict.nav.cta || "Obter a App"}</span>
    </a>
  );

  const renderDesktopButtons = () => (
    <div className="download-desktop-group">
      <a
        href={playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="download-btn download-btn-android"
        aria-label="Download from Google Play Store"
        title="Google Play Store"
      >
        <svg className="download-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M17.523 15.3414C17.523 16.3725 16.6868 17.2087 15.6557 17.2087H13.6267V19.4674C13.6267 20.3204 12.9238 21.0182 12.0708 21.0182C11.2178 21.0182 10.5149 20.3204 10.5149 19.4674V17.2087H8.48588C7.45479 17.2087 6.61863 16.3725 6.61863 15.3414V9.65857C6.61863 8.62749 7.45479 7.79133 8.48588 7.79133H15.6557C16.6868 7.79133 17.523 8.62749 17.523 9.65857V15.3414ZM16.3267 6.63471H7.81491C7.81491 4.54224 9.20894 2.80287 11.233 2.18182L10.3541 0.771968C10.2225 0.560413 10.2882 0.281895 10.5009 0.150244C10.7125 0.0173774 10.991 0.0843118 11.1226 0.295867L12.062 1.80284L13.0015 0.295867C13.1331 0.0843118 13.4116 0.0173774 13.6232 0.150244C13.8359 0.281895 13.9016 0.560413 13.77 0.771968L12.8911 2.18182C14.9151 2.80287 16.3267 4.54224 16.3267 6.63471ZM5.52627 9.65857C5.52627 8.80556 4.82333 8.10775 3.97032 8.10775C3.11732 8.10775 2.41438 8.80556 2.41438 9.65857V14.1687C2.41438 15.0217 3.11732 15.7196 3.97032 15.7196C4.82333 15.7196 5.52627 15.0217 5.52627 14.1687V9.65857ZM21.7272 9.65857C21.7272 8.80556 21.0242 8.10775 20.1712 8.10775C19.3182 8.10775 18.6153 8.80556 18.6153 9.65857V14.1687C18.6153 15.0217 19.3182 15.7196 20.1712 15.7196C21.0242 15.7196 21.7272 15.0217 21.7272 14.1687V9.65857ZM10.2862 10.9705C10.2862 10.5147 9.91741 10.1458 9.46162 10.1458C9.00583 10.1458 8.63699 10.5147 8.63699 10.9705C8.63699 11.4263 9.00583 11.7952 9.46162 11.7952C9.91741 11.7952 10.2862 11.4263 10.2862 10.9705ZM15.5033 10.9705C15.5033 10.5147 15.1345 10.1458 14.6787 10.1458C14.2229 10.1458 13.8541 10.5147 13.8541 10.9705C13.8541 11.4263 14.2229 11.7952 14.6787 11.7952C15.1345 11.7952 15.5033 11.4263 15.5033 10.9705Z" />
        </svg>
        <span className="download-btn-text">Android</span>
      </a>
      <a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="download-btn download-btn-ios"
        aria-label="Download from Apple App Store"
        title="Apple App Store"
      >
        <svg className="download-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
        </svg>
        <span className="download-btn-text">iOS</span>
      </a>
    </div>
  );

  if (platform === null) {
    return (
      <div className={`download-wrapper loading ${className}`} style={{ minWidth: 100, display: "inline-flex", justifyContent: "center" }}>
        <span className="cta" style={{ opacity: 0.6 }}>{dict.nav.cta || "Obter a App"}</span>
      </div>
    );
  }

  return (
    <div className={`download-wrapper ${className}`}>
      {platform === "android" && renderAndroidButton()}
      {platform === "ios" && renderIosButton()}
      {platform === "desktop" && renderDesktopButtons()}
    </div>
  );
}
