import { describe, it, expect } from 'vitest';
import { clientsReducer, clearError, type ClientsState } from './clientsSlice';
import {
  addAddress,
  createClient,
  deleteClient,
  fetchClientById,
  fetchClients,
  removeAddress,
  updateAddress,
  updateClient,
} from './clientsThunks';
import { makeAddress, makeClient } from '@/test/fixtures';

const initialState: ClientsState = {
  items: [],
  status: 'idle',
  detailStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
};

describe('clientsSlice — fetchClients (list)', () => {
  it('sets status to loading on pending', () => {
    const next = clientsReducer(
      { ...initialState, error: 'stale error' },
      fetchClients.pending('req-1', undefined),
    );
    expect(next.status).toBe('loading');
    expect(next.error).toBeNull();
  });

  it('replaces items and marks succeeded on fulfilled', () => {
    const items = [makeClient({ id: 'c1' }), makeClient({ id: 'c2' })];
    const next = clientsReducer(
      initialState,
      fetchClients.fulfilled(items, 'req-1', undefined),
    );
    expect(next.status).toBe('succeeded');
    expect(next.items).toEqual(items);
  });

  it('sets failed status and error message on rejected', () => {
    const next = clientsReducer(
      { ...initialState, status: 'loading' },
      fetchClients.rejected(null, 'req-1', undefined, {
        status: 500,
        message: 'Server exploded',
      }),
    );
    expect(next.status).toBe('failed');
    expect(next.error).toBe('Server exploded');
  });
});

describe('clientsSlice — fetchClientById (detail)', () => {
  it('upserts the fetched client and marks detailStatus succeeded', () => {
    const stale = makeClient({ id: 'c1', name: 'Old Name' });
    const fresh = makeClient({ id: 'c1', name: 'New Name' });

    const next = clientsReducer(
      { ...initialState, items: [stale] },
      fetchClientById.fulfilled(fresh, 'req-1', 'c1'),
    );
    expect(next.detailStatus).toBe('succeeded');
    expect(next.items).toEqual([fresh]);
  });

  it('appends when the client was not in items', () => {
    const next = clientsReducer(
      initialState,
      fetchClientById.fulfilled(makeClient({ id: 'c1' }), 'req-1', 'c1'),
    );
    expect(next.items).toHaveLength(1);
    expect(next.items[0]?.id).toBe('c1');
  });

  it('does NOT touch list status on detail rejected', () => {
    const before: ClientsState = { ...initialState, status: 'succeeded', items: [makeClient()] };
    const next = clientsReducer(
      before,
      fetchClientById.rejected(null, 'req-1', 'c1', {
        status: 404,
        message: 'Not found',
      }),
    );
    expect(next.status).toBe('succeeded'); // list status untouched
    expect(next.detailStatus).toBe('failed');
    expect(next.error).toBe('Not found');
  });
});

describe('clientsSlice — createClient', () => {
  it('appends the created client and marks mutationStatus succeeded', () => {
    const created = makeClient({ id: 'new-1', name: 'New Co' });
    const next = clientsReducer(
      initialState,
      createClient.fulfilled(created, 'req-1', {
        name: 'New Co',
        email: 'a@b.co',
        phone: '+1-555-0000',
      }),
    );
    expect(next.mutationStatus).toBe('succeeded');
    expect(next.items).toHaveLength(1);
    expect(next.items[0]?.name).toBe('New Co');
  });
});

describe('clientsSlice — updateClient', () => {
  it('replaces the matching client by id', () => {
    const original = makeClient({ id: 'c1', name: 'Old' });
    const updated = { ...original, name: 'New' };

    const next = clientsReducer(
      { ...initialState, items: [original] },
      updateClient.fulfilled(updated, 'req-1', { id: 'c1', changes: { name: 'New' } }),
    );
    expect(next.items[0]?.name).toBe('New');
    expect(next.items).toHaveLength(1);
  });
});

describe('clientsSlice — deleteClient', () => {
  it('removes the client by id', () => {
    const c1 = makeClient({ id: 'c1' });
    const c2 = makeClient({ id: 'c2' });
    const next = clientsReducer(
      { ...initialState, items: [c1, c2] },
      deleteClient.fulfilled('c1', 'req-1', 'c1'),
    );
    expect(next.items.map((c) => c.id)).toEqual(['c2']);
  });
});

describe('clientsSlice — address mutations', () => {
  it('addAddress upserts the returned client (with new address embedded)', () => {
    const c1 = makeClient({ id: 'c1', addresses: [] });
    const newAddress = makeAddress({ id: 'addr-new' });
    const updated = { ...c1, addresses: [newAddress] };

    const next = clientsReducer(
      { ...initialState, items: [c1] },
      addAddress.fulfilled(updated, 'req-1', { clientId: 'c1', input: newAddress }),
    );
    expect(next.items[0]?.addresses).toHaveLength(1);
    expect(next.items[0]?.addresses[0]?.id).toBe('addr-new');
    expect(next.mutationStatus).toBe('succeeded');
  });

  it('updateAddress replaces the matching address inside the client', () => {
    const original = makeAddress({ id: 'addr-1', street: '1 Original' });
    const updated = makeAddress({ id: 'addr-1', street: '2 Updated' });
    const c1 = makeClient({ id: 'c1', addresses: [original] });
    const c1Updated = { ...c1, addresses: [updated] };

    const next = clientsReducer(
      { ...initialState, items: [c1] },
      updateAddress.fulfilled(c1Updated, 'req-1', {
        clientId: 'c1',
        addressId: 'addr-1',
        input: updated,
      }),
    );
    expect(next.items[0]?.addresses[0]?.street).toBe('2 Updated');
  });

  it('removeAddress drops the targeted address from the client', () => {
    const a = makeAddress({ id: 'a' });
    const b = makeAddress({ id: 'b' });
    const c1 = makeClient({ id: 'c1', addresses: [a, b] });
    const c1WithoutA = { ...c1, addresses: [b] };

    const next = clientsReducer(
      { ...initialState, items: [c1] },
      removeAddress.fulfilled(c1WithoutA, 'req-1', { clientId: 'c1', addressId: 'a' }),
    );
    expect(next.items[0]?.addresses.map((x) => x.id)).toEqual(['b']);
  });
});

describe('clientsSlice — mutation pending/rejected', () => {
  it('marks mutationStatus loading for any mutation pending', () => {
    const next = clientsReducer(
      { ...initialState, error: 'stale' },
      createClient.pending('req-1', { name: 'X', email: 'x@y.z', phone: '+1-555-0000' }),
    );
    expect(next.mutationStatus).toBe('loading');
    expect(next.error).toBeNull();
  });

  it('persists error message from a rejected mutation', () => {
    const next = clientsReducer(
      initialState,
      deleteClient.rejected(null, 'req-1', 'c1', {
        status: 'network',
        message: 'Network error',
      }),
    );
    expect(next.mutationStatus).toBe('failed');
    expect(next.error).toBe('Network error');
  });
});

describe('clientsSlice — clearError', () => {
  it('clears the error field without touching items', () => {
    const items = [makeClient()];
    const next = clientsReducer(
      { ...initialState, error: 'boom', items },
      clearError(),
    );
    expect(next.error).toBeNull();
    expect(next.items).toBe(items);
  });
});
