import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = 'true',
  className 
}) => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9304808102028896';
  const adRef = useRef<boolean>(false);

  useEffect(() => {
    if (adRef.current) return;

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          adRef.current = true;
        }
      } catch (e) {
        // Only log if it's not the "already have ads" error which can be benign in dev/HMR
        if (e instanceof Error && !e.message.includes('already have ads')) {
          console.error("AdSense error:", e);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`overflow-hidden min-h-[100px] ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};
