import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const agencyLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const customerLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const adminCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().optional(),
  adminRole: z.enum(['admin'], {
    errorMap: () => ({ message: 'Admin role must be admin' })
  })
});

export const agencyRegisterSchema = z.object({
  name: z.string().min(2, 'Agency name must be at least 2 characters').max(200, 'Agency name cannot exceed 200 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const customerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().optional()
});

export const agencyProfileUpdateSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters').max(200, 'Tagline cannot exceed 200 characters'),
  businessInfo: z.object({
    legalName: z.string().min(2, 'Legal name must be at least 2 characters'),
    businessType: z.string().min(2, 'Business type must be at least 2 characters'),
    taxId: z.string().min(5, 'Tax ID must be at least 5 characters'),
    yearEstablished: z.number().min(1900, 'Year established must be after 1900').max(new Date().getFullYear(), 'Year established cannot be in the future')
  }),
  licensing: z.object({
    licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
    insurance: z.string().min(2, 'Insurance status must be at least 2 characters'),
    complianceStatus: z.string().min(2, 'Compliance status must be at least 2 characters')
  }),
  locations: z.object({
    headquarters: z.string().min(10, 'Headquarters address must be at least 10 characters'),
    branches: z.array(z.string().min(5, 'Branch name must be at least 5 characters')).optional(),
    serviceAreas: z.array(z.string().min(2, 'Service area must be at least 2 characters')).min(1, 'At least one service area is required')
  }),
  expertise: z.object({
    propertyTypes: z.array(z.string().min(2, 'Property type must be at least 2 characters')).min(1, 'At least one property type is required'),
    priceRanges: z.array(z.string().min(3, 'Price range must be at least 3 characters')).min(1, 'At least one price range is required'),
    neighborhoods: z.array(z.string().min(2, 'Neighborhood must be at least 2 characters')).min(1, 'At least one neighborhood is required')
  })
});

export const agencyVerificationRequestSchema = z.object({
  // No fields needed - uses current profile data
});

export const adminAgencyVerificationSchema = z.object({
  notes: z.string().optional(),
  verificationDate: z.date().optional()
});

export const adminAgencyRejectionSchema = z.object({
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500, 'Rejection reason cannot exceed 500 characters'),
  rejectionDate: z.date().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});
