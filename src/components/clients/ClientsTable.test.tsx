import type { ComponentProps } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { ClientsTable } from './ClientsTable';
import { theme } from '@/styles/theme';
import { makeAddress, makeClient } from '@/test/fixtures';

/**
 * ClientsTable is a presentational component — no Redux, no router data,
 * just props. Tests assert it renders the data the page hands it and calls
 * back the right callback for each action.
 */

const renderTable = (props: Partial<ComponentProps<typeof ClientsTable>> = {}) => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const utils = render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ThemeProvider theme={theme}>
        <ClientsTable
          clients={[]}
          onEdit={onEdit}
          onDelete={onDelete}
          {...props}
        />
      </ThemeProvider>
    </MemoryRouter>,
  );
  return { ...utils, onEdit, onDelete };
};

describe('ClientsTable', () => {
  it('renders the empty state when there are no clients', () => {
    renderTable({ clients: [] });
    expect(screen.getByText(/sin clientes registrados/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders one row per client with name and contact info', () => {
    const clients = [
      makeClient({ id: 'c1', name: 'Acme Corporation', email: 'a@acme.com' }),
      makeClient({ id: 'c2', name: 'Globex S.A.', email: 'b@globex.do' }),
    ];
    renderTable({ clients });

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    expect(screen.getByText('Globex S.A.')).toBeInTheDocument();
    expect(screen.getByText('a@acme.com')).toBeInTheDocument();
    // Both data rows present (excluding header row)
    const dataRows = screen.getAllByRole('row').slice(1);
    expect(dataRows).toHaveLength(2);
  });

  it('renders the address count chip', () => {
    const clients = [
      makeClient({ id: 'c1', addresses: [makeAddress({ id: 'a1' }), makeAddress({ id: 'a2' })] }),
    ];
    renderTable({ clients });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onEdit with the client when the edit button is pressed', async () => {
    const client = makeClient({ id: 'c1', name: 'Acme Corporation' });
    const { onEdit } = renderTable({ clients: [client] });

    await userEvent.click(screen.getByRole('button', { name: /editar acme corporation/i }));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(client);
  });

  it('calls onDelete with the client when the delete button is pressed', async () => {
    const client = makeClient({ id: 'c1', name: 'Acme Corporation' });
    const { onDelete } = renderTable({ clients: [client] });

    await userEvent.click(screen.getByRole('button', { name: /eliminar acme corporation/i }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(client);
  });

  it('exposes a "view" link to /clients/:id for each row', () => {
    const client = makeClient({ id: 'c1', name: 'Acme Corporation' });
    renderTable({ clients: [client] });

    // Row contains both a name link and a "view" icon link — both go to detail
    const links = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('href') === '/clients/c1');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('renders headers in Spanish DO sentence-case', () => {
    renderTable({ clients: [makeClient()] });
    const head = screen.getAllByRole('row')[0];
    expect(head).toBeDefined();
    if (!head) return;
    const headerText = within(head).getAllByRole('columnheader').map((c) => c.textContent);
    expect(headerText).toEqual([
      'Cliente',
      'Contacto',
      'Direcciones',
      'Registrado',
      'Acciones',
    ]);
  });
});
