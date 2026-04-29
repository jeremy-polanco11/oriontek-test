/** A physical address belonging to a client. */
export interface Address {
  id: string;
  /** Optional human label, e.g. "Headquarters", "Warehouse". */
  label?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

/** A client of OrionTek. Owns N addresses. */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** ISO 8601 timestamp. Set by the server (or client at create time for the mock). */
  createdAt: string;
  addresses: Address[];
}

/** Payload to create a client. The id, createdAt, and addresses are derived. */
export type CreateClientInput = Omit<Client, 'id' | 'createdAt' | 'addresses'>;

/** Payload to update a client's top-level fields. */
export type UpdateClientInput = Partial<CreateClientInput>;

/** Payload to create or update an address. */
export type AddressInput = Omit<Address, 'id'>;
