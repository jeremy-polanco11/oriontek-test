import { createAsyncThunk } from '@reduxjs/toolkit';
import { toApiError, type ApiErrorPayload } from '@/services/api';
import { clientsService } from './clientsService';
import type {
  AddressInput,
  Client,
  CreateClientInput,
  UpdateClientInput,
} from './types';

type ThunkConfig = { rejectValue: ApiErrorPayload };

export const fetchClients = createAsyncThunk<Client[], void, ThunkConfig>(
  'clients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await clientsService.list();
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  },
);

export const fetchClientById = createAsyncThunk<Client, string, ThunkConfig>(
  'clients/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await clientsService.getById(id);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  },
);

export const createClient = createAsyncThunk<Client, CreateClientInput, ThunkConfig>(
  'clients/create',
  async (input, { rejectWithValue }) => {
    try {
      return await clientsService.create(input);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  },
);

export const updateClient = createAsyncThunk<
  Client,
  { id: string; changes: UpdateClientInput },
  ThunkConfig
>('clients/update', async ({ id, changes }, { rejectWithValue }) => {
  try {
    return await clientsService.update(id, changes);
  } catch (err) {
    return rejectWithValue(toApiError(err));
  }
});

export const deleteClient = createAsyncThunk<string, string, ThunkConfig>(
  'clients/delete',
  async (id, { rejectWithValue }) => {
    try {
      await clientsService.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  },
);

export const addAddress = createAsyncThunk<
  Client,
  { clientId: string; input: AddressInput },
  ThunkConfig
>('clients/addAddress', async ({ clientId, input }, { rejectWithValue }) => {
  try {
    return await clientsService.addAddress(clientId, input);
  } catch (err) {
    return rejectWithValue(toApiError(err));
  }
});

export const updateAddress = createAsyncThunk<
  Client,
  { clientId: string; addressId: string; input: AddressInput },
  ThunkConfig
>(
  'clients/updateAddress',
  async ({ clientId, addressId, input }, { rejectWithValue }) => {
    try {
      return await clientsService.updateAddress(clientId, addressId, input);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  },
);

export const removeAddress = createAsyncThunk<
  Client,
  { clientId: string; addressId: string },
  ThunkConfig
>('clients/removeAddress', async ({ clientId, addressId }, { rejectWithValue }) => {
  try {
    return await clientsService.removeAddress(clientId, addressId);
  } catch (err) {
    return rejectWithValue(toApiError(err));
  }
});
