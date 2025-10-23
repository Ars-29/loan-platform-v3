import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import obReducer from '@/store/slices/obSlice';
import { templateApi } from '@/store/apis/templateApi';
import { obApi } from '@/store/apis/obApi';
import { storage } from '@/store/persistStorage';
import type { UiState } from '@/store/slices/uiSlice';
import type { ObState } from '@/store/slices/obSlice';

const uiPersistConfig = {
  key: 'ui',
  version: 1,
  storage,
  whitelist: ['selectedTemplate', 'customizerMode'],
};

const persistedUiReducer = persistReducer<UiState>(uiPersistConfig, uiReducer);

const obPersistConfig = {
  key: 'ob',
  version: 1,
  storage,
  whitelist: ['lastSearchParams', 'lastSearchAt'],
};

const persistedObReducer = persistReducer<ObState>(obPersistConfig, obReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: persistedUiReducer,
    ob: persistedObReducer,
    [templateApi.reducerPath]: templateApi.reducer,
    [obApi.reducerPath]: obApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(templateApi.middleware)
      .concat(obApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
