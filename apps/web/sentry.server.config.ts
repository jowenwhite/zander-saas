import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN_WEB,

  // Environment configuration
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // PII Protection: Don't send user data
  sendDefaultPii: false,

  // Filter sensitive data from error events
  beforeSend(event) {
    // Remove any potential PII from user context
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // Scrub sensitive data from request
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    if (event.request?.data) {
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization', 'creditCard'];
      let data = typeof event.request.data === 'string'
        ? event.request.data
        : JSON.stringify(event.request.data);

      sensitiveKeys.forEach(key => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`, 'gi');
        data = data.replace(regex, `"${key}":"[REDACTED]"`);
      });
      event.request.data = data;
    }

    return event;
  },
});
