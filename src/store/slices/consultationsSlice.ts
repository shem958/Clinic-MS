import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Consultation } from '@/types';
import { MOCK_CONSULTATIONS } from '@/lib/mockData';

interface ConsultationsState {
  items: Consultation[];
}

const initialState: ConsultationsState = {
  items: MOCK_CONSULTATIONS,
};

export const consultationsSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    addConsultation: (state, action: PayloadAction<Omit<Consultation, 'id'>>) => {
      const newCon: Consultation = {
        ...action.payload,
        id: `con-${Date.now().toString().slice(-4)}`,
      };
      state.items.unshift(newCon);
    },
    updateConsultation: (state, action: PayloadAction<Consultation>) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
    },
  },
});

export const { addConsultation, updateConsultation } = consultationsSlice.actions;
export default consultationsSlice.reducer;
