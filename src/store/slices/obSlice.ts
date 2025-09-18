import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ObState {
  lastSearchParams: Record<string, unknown> | null;
  lastSearchAt: string | null;
}

const initialState: ObState = {
  lastSearchParams: null,
  lastSearchAt: null,
};

export const obSlice = createSlice({
  name: 'ob',
  initialState,
  reducers: {
    setLastSearch: (
      state,
      action: PayloadAction<{ params: Record<string, unknown>; at?: string }>
    ) => {
      state.lastSearchParams = action.payload.params;
      state.lastSearchAt = action.payload.at ?? new Date().toISOString();
    },
    clearLastSearch: (state) => {
      state.lastSearchParams = null;
      state.lastSearchAt = null;
    },
  },
});

export const { setLastSearch, clearLastSearch } = obSlice.actions;

export default obSlice.reducer;
