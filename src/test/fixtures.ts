import type { Address, Client } from '@/features/clients/types';

/**
 * Test fixtures — small builders so individual tests can override only what they care about.
 * Default values are realistic enough that a test can use `makeClient()` with no args.
 */

export const makeAddress = (overrides: Partial<Address> = {}): Address => ({
  id: 'addr-1',
  label: 'Headquarters',
  street: '350 5th Avenue',
  city: 'New York',
  state: 'NY',
  country: 'USA',
  zipCode: '10118',
  ...overrides,
});

export const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'client-1',
  name: 'Acme Corp',
  email: 'contact@acme.com',
  phone: '+1-555-100-2000',
  createdAt: '2025-01-15T10:30:00.000Z',
  addresses: [],
  ...overrides,
});
