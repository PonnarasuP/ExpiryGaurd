import React, { useEffect, useRef, useState } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (adRef.current || !containerRef.current) return;

    const initAd = () => {
      if (adRef.current) return;
      
      try {
        if (typeof window !== 'undefined') {
          if (!(window as any).adsbygoogle) {
            setIsBlocked(true);
            return;
          }
          
          // Only push if the container has width to avoid "availableWidth=0" error
          const width = containerRef.current?.offsetWidth;
          if (width && width > 0) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            adRef.current = true;
          }
        }
      } catch (e) {
        if (e instanceof Error && !e.message.includes('already have ads')) {
          console.error("AdSense error:", e);
        }
      }
    };

    // Use ResizeObserver to wait for the element to have a width
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          initAd();
          observer.disconnect();
        }
      }
    });

    observer.observe(containerRef.current);

    // Fallback timer
    const timer = setTimeout(initAd, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden min-h-[100px] bg-stone-50/30 rounded-2xl border border-stone-100/50 flex items-center justify-center ${className}`}
    >
      {isBlocked ? (
        <div className="text-center p-4">
          <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Ad Area</p>
          <p className="text-[9px] text-stone-300 mt-1">Ad content blocked or unavailable</p>
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      )}
    </div>
  );
};
