import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

// Stable stringify to create consistent cache keys for objects
function stableStringify(obj: any): string {
  const allKeys: string[] = [];
  JSON.stringify(obj, (key, value) => { allKeys.push(key); return value; });
  allKeys.sort();
  return JSON.stringify(obj, allKeys);
}

export interface BestExSearchResponse {
  success: boolean;
  data: any;
  searchCriteria: Record<string, unknown>;
  timestamp: string;
  isMockData?: boolean;
  source?: string;
}

export const obApi = createApi({
  reducerPath: 'obApi',
  baseQuery,
  tagTypes: ['OBSearch'],
  endpoints: (builder) => ({
    bestExSearch: builder.query<BestExSearchResponse, Record<string, unknown>>({
      query: (body) => ({
        url: '/api/ob/search',
        method: 'POST',
        body,
      }),
      // Long-lived cache for market rates
      keepUnusedDataFor: 12 * 60 * 60, // 12 hours (in seconds)
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}(${stableStringify(queryArgs)})`;
      },
      providesTags: (result, error, arg) => [{ type: 'OBSearch', id: stableStringify(arg) }],
    }),
  }),
});

export const { useBestExSearchQuery, useLazyBestExSearchQuery } = obApi;
