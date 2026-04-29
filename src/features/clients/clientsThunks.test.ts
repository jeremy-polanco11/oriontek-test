import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { clientsReducer } from './clientsSlice';
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

/**
 * Mock the service layer — thunks orchestrate, the service does HTTP. Mocking
 * here verifies the orchestration without needing axios/MSW. Service-layer
 * tests are a separate concern (would assert the HTTP call shape).
 */
vi.mock('./clientsService', () => ({
  clientsService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    removeAddress: vi.fn(),
  },
}));

import { clientsService } from './clientsService';

const buildStore = () =>
  configureStore({ reducer: { clients: clientsReducer } });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchClients', () => {
  it('dispatches fulfilled with the service payload', async () => {
    const items = [makeClient({ id: 'c1' })];
    vi.mocked(clientsService.list).mockResolvedValueOnce(items);

    const store = buildStore();
    const result = await store.dispatch(fetchClients());

    expect(fetchClients.fulfilled.match(result)).toBe(true);
    expect(store.getState().clients.items).toEqual(items);
    expect(clientsService.list).toHaveBeenCalledOnce();
  });

  it('dispatches rejected with normalized error on network failure', async () => {
    const networkErr = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      request: {}, // no response → "network" status
    });
    vi.mocked(clientsService.list).mockRejectedValueOnce(networkErr);

    const store = buildStore();
    const result = await store.dispatch(fetchClients());

    expect(fetchClients.rejected.match(result)).toBe(true);
    expect(store.getState().clients.status).toBe('failed');
    expect(store.getState().clients.error).toBeTruthy();
  });
});

describe('createClient', () => {
  it('appends the created client to items on success', async () => {
    const created = makeClient({ id: 'new-1', name: 'New Co' });
    vi.mocked(clientsService.create).mockResolvedValueOnce(created);

    const store = buildStore();
    await store.dispatch(
      createClient({ name: 'New Co', email: 'a@b.co', phone: '+1-555-0000' }),
    );

    expect(store.getState().clients.items).toContainEqual(created);
    expect(clientsService.create).toHaveBeenCalledWith({
      name: 'New Co',
      email: 'a@b.co',
      phone: '+1-555-0000',
    });
  });
});

describe('updateClient', () => {
  it('replaces the existing client by id', async () => {
    const original = makeClient({ id: 'c1', name: 'Old' });
    const updated = { ...original, name: 'New' };
    vi.mocked(clientsService.update).mockResolvedValueOnce(updated);

    const store = configureStore({
      reducer: { clients: clientsReducer },
      preloadedState: {
        clients: {
          items: [original],
          status: 'succeeded' as const,
          detailStatus: 'idle' as const,
          mutationStatus: 'idle' as const,
          error: null,
        },
      },
    });

    await store.dispatch(updateClient({ id: 'c1', changes: { name: 'New' } }));

    expect(store.getState().clients.items[0]?.name).toBe('New');
    expect(clientsService.update).toHaveBeenCalledWith('c1', { name: 'New' });
  });
});

describe('deleteClient', () => {
  it('removes the client by id and returns the id as payload', async () => {
    vi.mocked(clientsService.remove).mockResolvedValueOnce(undefined);

    const store = configureStore({
      reducer: { clients: clientsReducer },
      preloadedState: {
        clients: {
          items: [makeClient({ id: 'c1' }), makeClient({ id: 'c2' })],
          status: 'succeeded' as const,
          detailStatus: 'idle' as const,
          mutationStatus: 'idle' as const,
          error: null,
        },
      },
    });

    const result = await store.dispatch(deleteClient('c1'));

    expect(deleteClient.fulfilled.match(result)).toBe(true);
    if (deleteClient.fulfilled.match(result)) {
      expect(result.payload).toBe('c1');
    }
    expect(store.getState().clients.items.map((c) => c.id)).toEqual(['c2']);
  });
});

describe('fetchClientById', () => {
  it('upserts the fetched client into items', async () => {
    const fresh = makeClient({ id: 'c1', name: 'Fresh' });
    vi.mocked(clientsService.getById).mockResolvedValueOnce(fresh);

    const store = buildStore();
    await store.dispatch(fetchClientById('c1'));

    expect(store.getState().clients.items).toEqual([fresh]);
    expect(store.getState().clients.detailStatus).toBe('succeeded');
  });
});

describe('address thunks', () => {
  const baseClient = makeClient({ id: 'c1', addresses: [makeAddress({ id: 'a1' })] });

  it('addAddress passes (clientId, input) to the service and merges the response', async () => {
    const newAddress = makeAddress({ id: 'a2', street: '2nd Ave' });
    const updatedClient = { ...baseClient, addresses: [...baseClient.addresses, newAddress] };
    vi.mocked(clientsService.addAddress).mockResolvedValueOnce(updatedClient);

    const store = buildStore();
    await store.dispatch(addAddress({ clientId: 'c1', input: newAddress }));

    expect(clientsService.addAddress).toHaveBeenCalledWith('c1', newAddress);
    expect(store.getState().clients.items[0]?.addresses).toHaveLength(2);
  });

  it('updateAddress passes (clientId, addressId, input)', async () => {
    const edited = makeAddress({ id: 'a1', street: 'Edited' });
    const updatedClient = { ...baseClient, addresses: [edited] };
    vi.mocked(clientsService.updateAddress).mockResolvedValueOnce(updatedClient);

    const store = buildStore();
    await store.dispatch(
      updateAddress({ clientId: 'c1', addressId: 'a1', input: edited }),
    );

    expect(clientsService.updateAddress).toHaveBeenCalledWith('c1', 'a1', edited);
    expect(store.getState().clients.items[0]?.addresses[0]?.street).toBe('Edited');
  });

  it('removeAddress passes (clientId, addressId) and replaces the client', async () => {
    const updatedClient = { ...baseClient, addresses: [] };
    vi.mocked(clientsService.removeAddress).mockResolvedValueOnce(updatedClient);

    const store = buildStore();
    await store.dispatch(removeAddress({ clientId: 'c1', addressId: 'a1' }));

    expect(clientsService.removeAddress).toHaveBeenCalledWith('c1', 'a1');
    expect(store.getState().clients.items[0]?.addresses).toHaveLength(0);
  });
});
