import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import type { WebStorage } from 'redux-persist/lib/types';

const createNoopStorage = (): WebStorage => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null as unknown as string);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  } as unknown as WebStorage;
};

export const storage: WebStorage = typeof window !== 'undefined'
  ? createWebStorage('local')
  : createNoopStorage();
