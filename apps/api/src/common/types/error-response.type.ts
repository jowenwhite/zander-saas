// MEDIUM-3: Standardized error response types

/**
 * Standard error response format for all API errors
 */
export interface ErrorResponse {
  /** HTTP status code */
  statusCode: number;

  /** Error type name (e.g., "Validation Error", "Not Found") */
  error: string;

  /** Human-readable error message or messages */
  message: string | string[];

  /** Additional error details (used for validation errors) */
  details?: string[];

  /** ISO timestamp when the error occurred */
  timestamp: string;

  /** Request path that caused the error */
  path?: string;
}

/**
 * Validation error response with detailed field errors
 */
export interface ValidationErrorResponse extends ErrorResponse {
  statusCode: 400;
  error: 'Validation Error';
  message: 'One or more fields failed validation';
  details: string[];
}

/**
 * Payload too large error response with size limits
 */
export interface PayloadTooLargeErrorResponse extends ErrorResponse {
  statusCode: 413;
  error: 'Payload Too Large';
  limits: {
    json: string;
    urlencoded: string;
    raw: string;
    fileUpload: string;
  };
}

/**
 * Rate limit error response
 */
export interface RateLimitErrorResponse extends ErrorResponse {
  statusCode: 429;
  error: 'Rate Limit Exceeded';
}
