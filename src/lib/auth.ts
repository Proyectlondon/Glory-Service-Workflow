// Centralized authentication configuration
// Default to a development secret if not provided in environment variables
export const JWT_SECRET = process.env.JWT_SECRET || "glory-workflow-secret-2024";

/**
 * Standardized error logger for auth-related issues
 */
export const logAuthError = (context: string, error: any) => {
  console.error(`[AUTH ERROR] ${context}:`, {
    message: error.message,
    stack: error.stack,
    details: error
  });
};
