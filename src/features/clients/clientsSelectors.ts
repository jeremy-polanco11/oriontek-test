import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

/*
 * Two kinds of selectors here:
 *
 * 1. Plain selectors (just field access) — these don't need memoization.
 *    Wrapping them in createSelector triggers Redux Toolkit's identity-warning
 *    because the result function would be the identity function.
 *
 * 2. Memoized selectors (real transformations: find, filter) — these get
 *    createSelector and only recompute when their inputs change. We also
 *    short-circuit to the plain input selector when there's nothing to
 *    transform, so memoization never wraps an identity function.
 */

export const selectAllClients = (state: RootState) => state.clients.items;
export const selectClientsStatus = (state: RootState) => state.clients.status;
export const selectClientsDetailStatus = (state: RootState) =>
  state.clients.detailStatus;
export const selectClientsMutationStatus = (state: RootState) =>
  state.clients.mutationStatus;
export const selectClientsError = (state: RootState) => state.clients.error;

/** Memoized — recomputes only when items[] or id changes. */
export const selectClientById = (id: string | undefined) => {
  if (!id) return (_state: RootState) => undefined;
  return createSelector(selectAllClients, (items) =>
    items.find((c) => c.id === id),
  );
};

/**
 * Memoized — recomputes only when items[] or search changes.
 * When search is empty, we skip memoization entirely (no transform → no need
 * to wrap), avoiding Redux Toolkit's identity-result warning.
 */
export const selectFilteredClients = (search: string) => {
  const q = search.trim().toLowerCase();
  if (!q) return selectAllClients;
  return createSelector(selectAllClients, (items) =>
    items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    ),
  );
};
