'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Initialize PostHog only on client side and in production
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,

      // Session replay - enabled
      capture_pageview: false, // We capture manually for better SPA support
      capture_pageleave: true,

      // Session replay configuration
      session_recording: {
        // Mask all text inputs for PII protection
        maskAllInputs: true,
        // Mask text selectors for PII protection (use * to mask all)
        maskTextSelector: '*',
        // Block specific selectors that might contain sensitive data
        blockSelector: '[data-posthog-block]',
      },

      // Feature flags support
      bootstrap: {
        featureFlags: {},
      },

      // Automatic properties
      autocapture: true,

      // Disable in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.opt_out_capturing();
        }
      },

      // Privacy settings
      persistence: 'localStorage+cookie',

      // Performance
      request_batching: true,
    });
  }
}

// Component to track pageviews in SPA
function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + '?' + searchParams.toString();
      }
      posthogClient.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}

// Wrapper to handle Suspense for useSearchParams
function SuspendedPageview() {
  return (
    <Suspense fallback={null}>
      <PostHogPageview />
    </Suspense>
  );
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <SuspendedPageview />
      {children}
    </PHProvider>
  );
}

// Export posthog client for direct usage
export { posthog };
