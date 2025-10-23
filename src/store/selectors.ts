import type { RootState } from '@/store';

// Auth selectors
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated;
export const selectAccessToken = (s: RootState) => s.auth.accessToken;
export const selectUserId = (s: RootState) => s.auth.userId;
export const selectUserRole = (s: RootState) => s.auth.role;
export const selectCompanyId = (s: RootState) => s.auth.companyId;

// UI selectors
export const selectSelectedTemplate = (s: RootState) => s.ui.selectedTemplate;
export const selectCustomizerMode = (s: RootState) => s.ui.customizerMode;

// OB selectors
export const selectObLastSearch = (s: RootState) => s.ob.lastSearchParams;
export const selectObLastSearchAt = (s: RootState) => s.ob.lastSearchAt;
