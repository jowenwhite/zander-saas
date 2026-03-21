import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Next.js 16+ automatically enables instrumentation.ts
};

// Sentry build configuration
const sentryWebpackPluginOptions = {
  // Organization and project from environment
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT_WEB,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress source map upload logs unless there's an error
  silent: !process.env.CI,

  // Upload source maps for better error debugging
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hide source maps from client bundles in production
  hideSourceMaps: true,

  // Automatically annotate React components for better stack traces
  reactComponentAnnotation: {
    enabled: true,
  },

  // Only upload source maps in production builds
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
