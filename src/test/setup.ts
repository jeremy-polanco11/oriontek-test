import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Auto-unmount React Testing Library trees after each test.
 * Without this, leaked DOM nodes between tests cause flaky `getByRole` queries.
 */
afterEach(() => {
  cleanup();
});
