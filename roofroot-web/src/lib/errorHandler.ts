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
      toast.error('Network error. Please check your connection.');
    }
  };

  static handle(error: ApiError, options: ErrorHandlerOptions = {}): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Log detailed error information for debugging
    console.error('=== ERROR DEBUGGING ===');
    console.error('Error object:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================');

    const status = error.response?.status;
    const errorData = error.response?.data;

    switch (status) {
      case 400:
        // Validation errors
        const validationErrors = errorData?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          console.error('Validation errors:', validationErrors);
          mergedOptions.onValidationError?.(validationErrors);
        } else {
          mergedOptions.onServerError?.(errorData?.message || 'Validation failed');
        }
        break;

      case 401:
        // Authentication error
        console.error('Authentication error - user will be logged out');
        toast.error('Authentication failed. Please log in again.');
        mergedOptions.onAuthError?.();
        break;

      case 403:
        // Authorization error
        console.error('Authorization error - access denied');
        toast.error('Access denied. You do not have permission to perform this action.');
        break;

      case 404:
        // Not found
        console.error('Resource not found');
        toast.error('The requested resource was not found.');
        break;

      case 409:
        // Conflict (e.g., duplicate email)
        console.error('Conflict error');
        toast.error(errorData?.message || 'This resource already exists.');
        break;

      case 422:
        // Unprocessable entity
        console.error('Unprocessable entity error');
        toast.error(errorData?.message || 'Invalid data provided.');
        break;

      case 500:
        // Server error
        console.error('Server error');
        mergedOptions.onServerError?.(errorData?.message || 'Internal server error');
        break;

      default:
        if (!error.response) {
          // Network error
          console.error('Network error');
          mergedOptions.onNetworkError?.();
        } else {
          // Other errors
          console.error('Unknown error');
          mergedOptions.onServerError?.(errorData?.message || 'An unexpected error occurred');
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