import { toast } from 'react-hot-toast';
import { authUtils } from './utils';

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: string[];
    };
  };
  message?: string;
  stack?: string;
}

export interface ErrorHandlerOptions {
  onAuthError?: () => void;
  onValidationError?: (errors: string[]) => void;
  onServerError?: (message: string) => void;
  onNetworkError?: () => void;
}

export class ErrorHandler {
  private static defaultOptions: ErrorHandlerOptions = {
    onAuthError: () => {
      authUtils.logout();
      window.location.href = '/login';
    },
    onValidationError: (errors: string[]) => {
      if (errors.length > 0) {
        toast.error(`Validation error: ${errors[0]}`);
      }
    },
    onServerError: (message: string) => {
      toast.error(message || 'Server error occurred');
    },
    onNetworkError: () => {
      toast.error('Network error. Please check your connection and try again.');
    }
  };

  // Check if user is offline
  static isOffline(): boolean {
    return !navigator.onLine;
  }

  // Get specific error message based on error type
  static getErrorMessage(error: ApiError): string {
    const status = error.response?.status;
    const errorData = error.response?.data;

    switch (status) {
      case 400:
        return errorData?.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return errorData?.message || 'This resource already exists.';
      case 422:
        return errorData?.message || 'Invalid data provided.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Server temporarily unavailable. Please try again.';
      case 503:
        return 'Service temporarily unavailable. Please try again.';
      case 504:
        return 'Request timeout. Please try again.';
      default:
        if (!error.response) {
          return 'Network error. Please check your connection.';
        }
        return errorData?.message || 'An unexpected error occurred.';
    }
  }

  static handle(error: ApiError, options: ErrorHandlerOptions = {}): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Check if user is offline
    if (this.isOffline()) {
      toast.error('You are currently offline. Please check your internet connection.');
      return;
    }
    
    // Log detailed error information for debugging
    console.error('=== ERROR DEBUGGING ===');
    console.error('Error object:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Network status:', navigator.onLine ? 'Online' : 'Offline');
    console.error('========================');

    const status = error.response?.status;
    const errorData = error.response?.data;
    const errorMessage = this.getErrorMessage(error);

    switch (status) {
      case 400:
        // Validation errors
        const validationErrors = errorData?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          console.error('Validation errors:', validationErrors);
          mergedOptions.onValidationError?.(validationErrors);
        } else {
          toast.error(errorMessage);
        }
        break;

      case 401:
        // Authentication error
        console.error('Authentication error - user will be logged out');
        toast.error(errorMessage);
        mergedOptions.onAuthError?.();
        break;

      case 403:
        // Authorization error
        console.error('Authorization error - access denied');
        toast.error(errorMessage);
        break;

      case 404:
        // Not found
        console.error('Resource not found');
        toast.error(errorMessage);
        break;

      case 409:
        // Conflict (e.g., duplicate email)
        console.error('Conflict error');
        toast.error(errorMessage);
        break;

      case 422:
        // Unprocessable entity
        console.error('Unprocessable entity error');
        toast.error(errorMessage);
        break;

      case 429:
        // Rate limit
        console.error('Rate limit exceeded');
        toast.error(errorMessage);
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error('Server error');
        toast.error(errorMessage);
        break;

      default:
        if (!error.response) {
          // Network error
          console.error('Network error');
          mergedOptions.onNetworkError?.();
        } else {
          // Other errors
          console.error('Unknown error');
          toast.error(errorMessage);
        }
        break;
    }
  }

  static handleFormError(error: ApiError, formName: string): void {
    console.error(`=== ${formName.toUpperCase()} FORM ERROR ===`);
    this.handle(error, {
      onValidationError: (errors: string[]) => {
        if (errors.length > 0) {
          toast.error(`${formName} error: ${errors[0]}`);
        }
      },
      onServerError: (message: string) => {
        toast.error(`${formName} failed: ${message}`);
      }
    });
  }

  static handleAuthError(error: ApiError): void {
    console.error('=== AUTHENTICATION ERROR ===');
    this.handle(error, {
      onAuthError: () => {
        authUtils.logout();
        window.location.href = '/login';
      },
      onValidationError: (errors: string[]) => {
        if (errors.length > 0) {
          toast.error(`Authentication error: ${errors[0]}`);
        }
      },
      onServerError: (message: string) => {
        toast.error(`Authentication failed: ${message}`);
      }
    });
  }

  static handleListingError(error: ApiError): void {
    console.error('=== LISTING ERROR ===');
    this.handle(error, {
      onAuthError: () => {
        authUtils.logout();
        window.location.href = '/login';
      },
      onValidationError: (errors: string[]) => {
        if (errors.length > 0) {
          toast.error(`Property error: ${errors[0]}`);
        }
      },
      onServerError: (message: string) => {
        toast.error(`Property operation failed: ${message}`);
      }
    });
  }
}

// Convenience functions for common operations
export const handleFormError = (error: ApiError, formName: string) => {
  ErrorHandler.handleFormError(error, formName);
};

export const handleAuthError = (error: ApiError) => {
  ErrorHandler.handleAuthError(error);
};

export const handleListingError = (error: ApiError) => {
  ErrorHandler.handleListingError(error);
}; 