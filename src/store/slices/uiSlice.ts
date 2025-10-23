import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CustomizerMode {
  isCustomizerMode: boolean;
  customTemplate?: any;
  officerInfo?: {
    officerName: string;
    phone?: string;
    email: string;
  };
}

export interface UiState {
  selectedTemplate: 'template1' | 'template2';
  customizerMode: CustomizerMode;
}

const initialState: UiState = {
  selectedTemplate: 'template1',
  customizerMode: {
    isCustomizerMode: false,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedTemplate: (state, action: PayloadAction<'template1' | 'template2'>) => {
      state.selectedTemplate = action.payload;
    },
    setCustomizerMode: (state, action: PayloadAction<CustomizerMode>) => {
      state.customizerMode = action.payload;
    },
    clearCustomizerMode: (state) => {
      state.customizerMode = { isCustomizerMode: false };
    },
  },
});

export const { setSelectedTemplate, setCustomizerMode, clearCustomizerMode } = uiSlice.actions;

export default uiSlice.reducer;
