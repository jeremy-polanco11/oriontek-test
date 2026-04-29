import { v4 as uuid } from 'uuid';
import { api } from '@/services/api';
import type {
  Address,
  AddressInput,
  Client,
  CreateClientInput,
  UpdateClientInput,
} from './types';

/**
 * Data layer — pure HTTP. No store knowledge, no thunks.
 * Address CRUD is implemented as PUT /clients/:id with the rebuilt addresses[]
 * because json-server doesn't support nested resource updates idiomatically.
 * Against a real API, these would map to /clients/:id/addresses/:addressId.
 */
export const clientsService = {
  list: async (): Promise<Client[]> => {
    const { data } = await api.get<Client[]>('/clients');
    return data;
  },

  getById: async (id: string): Promise<Client> => {
    const { data } = await api.get<Client>(`/clients/${id}`);
    return data;
  },

  create: async (input: CreateClientInput): Promise<Client> => {
    const newClient: Client = {
      id: uuid(),
      ...input,
      createdAt: new Date().toISOString(),
      addresses: [],
    };
    const { data } = await api.post<Client>('/clients', newClient);
    return data;
  },

  update: async (id: string, changes: UpdateClientInput): Promise<Client> => {
    const { data } = await api.patch<Client>(`/clients/${id}`, changes);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  addAddress: async (clientId: string, input: AddressInput): Promise<Client> => {
    const current = await clientsService.getById(clientId);
    const next: Address = { id: uuid(), ...input };
    const updated: Client = {
      ...current,
      addresses: [...current.addresses, next],
    };
    const { data } = await api.put<Client>(`/clients/${clientId}`, updated);
    return data;
  },

  updateAddress: async (
    clientId: string,
    addressId: string,
    input: AddressInput,
  ): Promise<Client> => {
    const current = await clientsService.getById(clientId);
    const updated: Client = {
      ...current,
      addresses: current.addresses.map((a) =>
        a.id === addressId ? { ...a, ...input } : a,
      ),
    };
    const { data } = await api.put<Client>(`/clients/${clientId}`, updated);
    return data;
  },

  removeAddress: async (clientId: string, addressId: string): Promise<Client> => {
    const current = await clientsService.getById(clientId);
    const updated: Client = {
      ...current,
      addresses: current.addresses.filter((a) => a.id !== addressId),
    };
    const { data } = await api.put<Client>(`/clients/${clientId}`, updated);
    return data;
  },
};
