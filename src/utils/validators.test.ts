import { describe, it, expect } from 'vitest';
import { addressSchema, clientSchema } from './validators';

describe('clientSchema', () => {
  it('accepts well-formed input', () => {
    const result = clientSchema.safeParse({
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '+1-555-100-2000',
    });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from string fields', () => {
    const result = clientSchema.safeParse({
      name: '  Acme Corp  ',
      email: '  contact@acme.com  ',
      phone: '  +1-555-100-2000  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Acme Corp');
      expect(result.data.email).toBe('contact@acme.com');
    }
  });

  it.each([
    { field: 'name', value: 'A', err: /at least 2 characters/i },
    { field: 'email', value: 'not-an-email', err: /valid email/i },
    { field: 'phone', value: '12', err: /at least 6/i },
    { field: 'phone', value: 'abc-defg', err: /digits, spaces/i },
  ] as const)('rejects $field "$value" with $err', ({ field, value, err }) => {
    const result = clientSchema.safeParse({
      name: 'Default Name',
      email: 'default@example.com',
      phone: '+1-555-100-2000',
      [field]: value,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors[field];
      expect(fieldErrors?.[0]).toMatch(err);
    }
  });

  it('rejects missing required fields', () => {
    const result = clientSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('addressSchema', () => {
  const valid = {
    street: '350 5th Avenue',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zipCode: '10118',
  };

  it('accepts a valid address with optional label', () => {
    expect(addressSchema.safeParse({ ...valid, label: 'HQ' }).success).toBe(true);
  });

  it('accepts a valid address WITHOUT a label', () => {
    expect(addressSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an explicit empty-string label (UI default)', () => {
    expect(addressSchema.safeParse({ ...valid, label: '' }).success).toBe(true);
  });

  it.each(['street', 'city', 'state', 'country', 'zipCode'] as const)(
    'rejects when %s is missing',
    (field) => {
      const input = { ...valid, [field]: '' };
      const result = addressSchema.safeParse(input);
      expect(result.success).toBe(false);
    },
  );
});
