import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_WEB,

  // Environment configuration
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  // Only enable in production to avoid noise during development
  enabled: process.env.NODE_ENV === 'production',

  // Capture unhandled promise rejections
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Mask all text for PII protection
      maskAllText: true,
      // Block all media for PII protection
      blockAllMedia: true,
    }),
  ],

  // Performance monitoring sample rate
  tracesSampleRate: 0.1, // 10% of transactions

  // Session replay sample rate
  replaysSessionSampleRate: 0.0, // Disabled by default
  replaysOnErrorSampleRate: 0.1, // 10% of error sessions

  // PII Protection: Don't send user data
  sendDefaultPii: false,

  // Filter out sensitive data from breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Remove potentially sensitive URL parameters
    if (breadcrumb.category === 'navigation' && breadcrumb.data?.to) {
      const url = new URL(breadcrumb.data.to, 'http://localhost');
      url.searchParams.delete('token');
      url.searchParams.delete('email');
      url.searchParams.delete('password');
      breadcrumb.data.to = url.pathname + url.search;
    }
    return breadcrumb;
  },

  // Filter sensitive data from error events
  beforeSend(event) {
    // Remove any potential PII from user context
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // Scrub sensitive data from request bodies
    if (event.request?.data) {
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];
      const data = typeof event.request.data === 'string'
        ? event.request.data
        : JSON.stringify(event.request.data);

      sensitiveKeys.forEach(key => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`, 'gi');
        event.request!.data = data.replace(regex, `"${key}":"[REDACTED]"`);
      });
    }

    return event;
  },
});
