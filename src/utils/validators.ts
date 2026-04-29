import { z } from 'zod';

/**
 * Schemas — `.trim()` MUST come BEFORE validators. In Zod 3, methods chain
 * in declaration order, so putting `.trim()` last would mean `.email()` /
 * `.regex()` see un-trimmed input and reject "  contact@acme.com  " purely
 * because of the surrounding whitespace.
 */

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters'),
  email: z
    .string()
    .trim()
    .email('Must be a valid email')
    .max(120, 'Email too long'),
  phone: z
    .string()
    .trim()
    .min(6, 'Phone must be at least 6 characters')
    .max(40, 'Phone too long')
    .regex(/^[+()\-\d\s]+$/, 'Phone may contain digits, spaces, +, -, ()'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const addressSchema = z.object({
  label: z.string().trim().max(60, 'Label too long').optional().or(z.literal('')),
  street: z.string().trim().min(2, 'Street is required').max(160, 'Street too long'),
  city: z.string().trim().min(2, 'City is required').max(80, 'City too long'),
  state: z.string().trim().min(2, 'State is required').max(80, 'State too long'),
  country: z.string().trim().min(2, 'Country is required').max(80, 'Country too long'),
  zipCode: z
    .string()
    .trim()
    .min(2, 'ZIP/Postal code is required')
    .max(16, 'ZIP/Postal code too long'),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
