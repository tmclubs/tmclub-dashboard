import { z } from 'zod';

// Email validator
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

// Password validator
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Phone validator (Indonesian format)
export const phoneSchema = z
  .string()
  .regex(/^(?:\+62|62|0)[0-9]{9,13}$/, 'Invalid Indonesian phone number');

// URL validator
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .optional();

// Event form schema
export const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description is too long'),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().min(1, 'Venue is required').max(200, 'Venue is too long'),
  price: z.number().min(0, 'Price must be positive'),
  isFree: z.boolean(),
  maxParticipants: z.number().min(1, 'Max participants must be at least 1').optional(),
  eventType: z.enum(['offline', 'online', 'hybrid']),
});

// Company form schema
export const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  address: z.string().max(500, 'Address is too long').optional(),
  phone: phoneSchema.optional().or(z.literal('')),
  email: emailSchema.optional().or(z.literal('')),
  website: urlSchema,
  industry: z.string().max(100, 'Industry is too long').optional(),
});

// Survey form schema
export const surveyFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  questions: z.array(z.object({
    type: z.enum(['text', 'textarea', 'number', 'email', 'phone', 'date', 'choice', 'multiple_choice', 'rating', 'boolean']),
    label: z.string().min(1, 'Question label is required').max(200, 'Label is too long'),
    placeholder: z.string().max(200, 'Placeholder is too long').optional(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  })).min(1, 'At least one question is required'),
});

// Article form schema
export const articleFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt is too long').optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
  tags: z.array(z.string().max(50, 'Tag is too long')),
  status: z.enum(['draft', 'published']),
});

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Register form schema
export const registerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  company: z.string().max(100, 'Company name is too long').optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Export types
export type EventFormData = z.infer<typeof eventFormSchema>;
export type CompanyFormData = z.infer<typeof companyFormSchema>;
export type SurveyFormData = z.infer<typeof surveyFormSchema>;
export type ArticleFormData = z.infer<typeof articleFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const parseYouTubeId = (input: string): string => {
  const s = String(input || '').trim();
  if (!s) return '';
  const idPattern = /^[A-Za-z0-9_-]{11}$/;
  if (idPattern.test(s)) return s;
  try {
    const url = new URL(s);
    const host = url.hostname.toLowerCase();
    if (host.endsWith('youtu.be')) {
      const seg = url.pathname.replace(/^\//, '').split('/')[0];
      return idPattern.test(seg) ? seg : '';
    }
    if (host.includes('youtube.com')) {
      if (url.pathname.startsWith('/watch')) {
        const v = url.searchParams.get('v') || '';
        return idPattern.test(v) ? v : '';
      }
      const parts = url.pathname.replace(/^\//, '').split('/');
      if (parts.length >= 2 && (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live')) {
        const seg = parts[1];
        return idPattern.test(seg) ? seg : '';
      }
    }
    return '';
  } catch {
    const m = s.match(/v=([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
  }
};
