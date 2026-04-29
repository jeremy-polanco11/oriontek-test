import { describe, it, expect } from 'vitest';
import type { RootState } from '@/app/store';
import {
  selectAllClients,
  selectClientById,
  selectClientsError,
  selectClientsMutationStatus,
  selectClientsStatus,
  selectFilteredClients,
} from './clientsSelectors';
import { makeClient } from '@/test/fixtures';

const buildState = (overrides: Partial<RootState['clients']> = {}): RootState => ({
  clients: {
    items: [],
    status: 'idle',
    detailStatus: 'idle',
    mutationStatus: 'idle',
    error: null,
    ...overrides,
  },
});

describe('plain selectors', () => {
  it('selectAllClients returns the items array reference', () => {
    const items = [makeClient({ id: 'c1' })];
    const state = buildState({ items });
    expect(selectAllClients(state)).toBe(items);
  });

  it('selectClientsStatus / Mutation / Error read their fields', () => {
    const state = buildState({
      status: 'loading',
      mutationStatus: 'failed',
      error: 'oops',
    });
    expect(selectClientsStatus(state)).toBe('loading');
    expect(selectClientsMutationStatus(state)).toBe('failed');
    expect(selectClientsError(state)).toBe('oops');
  });
});

describe('selectClientById', () => {
  const c1 = makeClient({ id: 'c1', name: 'Acme' });
  const c2 = makeClient({ id: 'c2', name: 'Globex' });
  const state = buildState({ items: [c1, c2] });

  it('returns the matching client', () => {
    const sel = selectClientById('c2');
    expect(sel(state)).toEqual(c2);
  });

  it('returns undefined when id does not match', () => {
    const sel = selectClientById('does-not-exist');
    expect(sel(state)).toBeUndefined();
  });

  it('returns undefined for an empty / missing id (no createSelector wrap)', () => {
    expect(selectClientById(undefined)(state)).toBeUndefined();
  });
});

describe('selectFilteredClients', () => {
  const acme = makeClient({ id: 'c1', name: 'Acme Corp', email: 'a@acme.com', phone: '+1-555-1' });
  const globex = makeClient({ id: 'c2', name: 'Globex S.A.', email: 'b@globex.do', phone: '+1-809-7' });
  const initech = makeClient({ id: 'c3', name: 'Initech Ltd.', email: 'c@initech.io', phone: '+44-20-1' });
  const state = buildState({ items: [acme, globex, initech] });

  it('returns all items when search is empty (and skips memoization)', () => {
    expect(selectFilteredClients('')(state)).toEqual([acme, globex, initech]);
  });

  it('treats whitespace-only search as empty', () => {
    expect(selectFilteredClients('   ')(state)).toEqual([acme, globex, initech]);
  });

  it('filters by name (case-insensitive)', () => {
    expect(selectFilteredClients('acme')(state)).toEqual([acme]);
    expect(selectFilteredClients('ACME')(state)).toEqual([acme]);
  });

  it('filters by email substring', () => {
    expect(selectFilteredClients('globex.do')(state)).toEqual([globex]);
  });

  it('filters by phone substring', () => {
    expect(selectFilteredClients('+44')(state)).toEqual([initech]);
  });

  it('returns empty array when nothing matches', () => {
    expect(selectFilteredClients('nope-no-match')(state)).toEqual([]);
  });
});
