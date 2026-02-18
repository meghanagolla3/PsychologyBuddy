import { z } from 'zod';

export const LoginSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AdminLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const SessionSchema = z.object({
  sessionId: z.string().optional(),
});

export type SessionInput = z.infer<typeof SessionSchema>;

// Legacy validators for backward compatibility
export const validateStudentLogin = (body: any) => {
  const result = LoginSchema.safeParse(body);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  return result.data;
};

export const validateAdminLogin = (body: any) => {
  const result = AdminLoginSchema.safeParse(body);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  return result.data;
};
