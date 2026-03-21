import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN_API,

  // Environment configuration
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Integrations
  integrations: [
    // Performance profiling
    nodeProfilingIntegration(),
  ],

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1, // 10% of transactions for profiling

  // PII Protection: Don't send user data by default
  sendDefaultPii: false,

  // Filter sensitive data from error events
  beforeSend(event) {
    // Remove any potential PII from user context
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
      delete event.request.headers['x-auth-token'];
    }

    // Scrub sensitive data from request body
    if (event.request?.data) {
      const sensitiveKeys = [
        'password',
        'passwordHash',
        'token',
        'secret',
        'apiKey',
        'authorization',
        'creditCard',
        'cardNumber',
        'cvv',
        'ssn',
        'socialSecurityNumber',
      ];

      let data = typeof event.request.data === 'string'
        ? event.request.data
        : JSON.stringify(event.request.data);

      sensitiveKeys.forEach(key => {
        // Match both camelCase and snake_case versions
        const camelRegex = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`, 'gi');
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const snakeRegex = new RegExp(`"${snakeKey}"\\s*:\\s*"[^"]*"`, 'gi');

        data = data.replace(camelRegex, `"${key}":"[REDACTED]"`);
        data = data.replace(snakeRegex, `"${snakeKey}":"[REDACTED]"`);
      });

      event.request.data = data;
    }

    // Scrub sensitive query parameters
    if (event.request?.query_string && typeof event.request.query_string === 'string') {
      const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];
      let queryString = event.request.query_string;

      sensitiveParams.forEach(param => {
        const regex = new RegExp(`${param}=[^&]*`, 'gi');
        queryString = queryString.replace(regex, `${param}=[REDACTED]`);
      });

      event.request.query_string = queryString;
    }

    return event;
  },

  // Filter breadcrumbs to remove sensitive data
  beforeBreadcrumb(breadcrumb) {
    // Remove sensitive data from HTTP breadcrumbs
    if (breadcrumb.category === 'http' && breadcrumb.data) {
      if (breadcrumb.data.url) {
        try {
          const url = new URL(breadcrumb.data.url);
          ['token', 'key', 'secret', 'password', 'auth'].forEach(param => {
            url.searchParams.delete(param);
          });
          breadcrumb.data.url = url.toString();
        } catch {
          // URL parsing failed, leave as is
        }
      }
    }
    return breadcrumb;
  },
});

// Export for use in exception filter
export { Sentry };
