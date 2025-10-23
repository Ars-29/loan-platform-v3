import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'super_admin' | 'company_admin' | 'employee' | null;

export interface AuthState {
  userId: string | null;
  email: string | null;
  role: UserRole;
  companyId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  role: null,
  companyId: null,
  accessToken: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        userId: string | null;
        email: string | null;
        role: UserRole;
        companyId: string | null;
        accessToken: string | null;
      }>
    ) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.companyId = action.payload.companyId;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = !!action.payload.userId && !!action.payload.accessToken;
    },
    clearSession: (state) => {
      state.userId = null;
      state.email = null;
      state.role = null;
      state.companyId = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;

export default authSlice.reducer;
