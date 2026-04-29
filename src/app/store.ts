import { configureStore } from '@reduxjs/toolkit';
import { clientsReducer } from '@/features/clients/clientsSlice';

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
