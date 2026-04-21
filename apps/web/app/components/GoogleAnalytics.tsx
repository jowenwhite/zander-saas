'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// GA4 Measurement IDs by domain
const GA_MEASUREMENT_IDS = {
  landing: 'G-XFT3QWH1LV', // zanderos.com (landing page)
  app: 'G-3RZ6ST7S97',     // app.zanderos.com (application)
};

export function GoogleAnalytics() {
  const [measurementId, setMeasurementId] = useState<string | null>(null);

  useEffect(() => {
    // Detect hostname and set appropriate measurement ID
    const hostname = window.location.hostname;

    if (hostname === 'app.zanderos.com') {
      setMeasurementId(GA_MEASUREMENT_IDS.app);
    } else if (hostname === 'zanderos.com' || hostname === 'www.zanderos.com') {
      setMeasurementId(GA_MEASUREMENT_IDS.landing);
    } else if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      // Local development - use landing page ID for testing
      setMeasurementId(GA_MEASUREMENT_IDS.landing);
    } else {
      // Default to landing page for any other domains (preview URLs, etc.)
      setMeasurementId(GA_MEASUREMENT_IDS.landing);
    }
  }, []);

  // Don't render scripts until we've determined the measurement ID
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
