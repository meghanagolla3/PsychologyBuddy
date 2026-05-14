import { z } from 'zod';

export const CreateCounselorSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required').max(100, 'Department must be less than 100 characters'),
  specialization: z.string().max(200, 'Specialization must be less than 200 characters').optional(),
  availability: z.string().max(100, 'Availability must be less than 100 characters').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  schoolId: z.string().min(1, 'School ID is required').refine((val) => {
    // Accept both UUID format and custom school code format (e.g., SCH-BHS-152078-PP4)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    const schoolCodeRegex = /^SCH-[A-Z]{3}-\d{6}-[A-Z0-9]{3}$/;
    return uuidRegex.test(val) || schoolCodeRegex.test(val);
  }, { message: 'Invalid school ID format. Expected UUID or school code format (e.g., SCH-BHS-152078-PP4)' }),
  locationId: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty values
    // Validate UUID format if provided
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(val);
  }, { message: 'Invalid location ID format' }),
});

export const UpdateCounselorSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required').max(100, 'Department must be less than 100 characters').optional(),
  specialization: z.string().max(200, 'Specialization must be less than 200 characters').optional(),
  availability: z.string().max(100, 'Availability must be less than 100 characters').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  schoolId: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty values
    // Accept both UUID format and custom school code format (e.g., SCH-BHS-152078-PP4)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    const schoolCodeRegex = /^SCH-[A-Z]{3}-\d{6}-[A-Z0-9]{3}$/;
    return uuidRegex.test(val) || schoolCodeRegex.test(val);
  }, { message: 'Invalid school ID format. Expected UUID or school code format (e.g., SCH-BHS-152078-PP4)' }),
  locationId: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty values
    // Validate UUID format if provided
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(val);
  }, { message: 'Invalid location ID format' }),
});

export const UpdateCounselorStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export type CreateCounselorRequest = z.infer<typeof CreateCounselorSchema>;
export type UpdateCounselorRequest = z.infer<typeof UpdateCounselorSchema>;
export type UpdateCounselorStatusRequest = z.infer<typeof UpdateCounselorStatusSchema>;
