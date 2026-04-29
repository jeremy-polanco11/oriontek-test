import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Client } from './types';
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

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ClientsState {
  items: Client[];
  /** Aggregate list-status: tracks fetchClients. Item-level mutations don't toggle it. */
  status: RequestStatus;
  /** Status for the currently-open detail view (fetchClientById). */
  detailStatus: RequestStatus;
  /** Status for any in-flight mutation (create / update / delete + address ops). */
  mutationStatus: RequestStatus;
  error: string | null;
}

const initialState: ClientsState = {
  items: [],
  status: 'idle',
  detailStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
};

/**
 * Helper: replace one client in items[]. Used by all mutation thunks since
 * the server returns the full updated client.
 */
const upsert = (state: ClientsState, client: Client) => {
  const idx = state.items.findIndex((c) => c.id === client.id);
  if (idx === -1) state.items.push(client);
  else state.items[idx] = client;
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // List
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action: PayloadAction<Client[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? 'Failed to load clients';
      });

    // Detail
    builder
      .addCase(fetchClientById.pending, (state) => {
        state.detailStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        upsert(state, action.payload);
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload?.message ?? 'Client not found';
      });

    // Mutations — group every mutation thunk into a single status flag so the
    // UI can disable buttons while any operation is pending.
    const mutationThunks = [
      createClient,
      updateClient,
      deleteClient,
      addAddress,
      updateAddress,
      removeAddress,
    ];

    mutationThunks.forEach((thunk) => {
      builder.addCase(thunk.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        // All rejected mutation thunks share ThunkConfig<{rejectValue: ApiErrorPayload}>.
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message ?? 'Operation failed';
      });
    });

    // Specific fulfilled handlers (need different state shapes)
    builder
      .addCase(createClient.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        upsert(state, action.payload);
      })
      .addCase(deleteClient.fulfilled, (state, action: PayloadAction<string>) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        upsert(state, action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        upsert(state, action.payload);
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        upsert(state, action.payload);
      });
  },
});

export const { clearError } = clientsSlice.actions;
export const clientsReducer = clientsSlice.reducer;
