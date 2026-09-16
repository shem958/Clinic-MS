import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Prescription } from '@/types';
import { MOCK_PRESCRIPTIONS } from '@/lib/mockData';

interface PrescriptionsState {
  items: Prescription[];
}

const initialState: PrescriptionsState = {
  items: MOCK_PRESCRIPTIONS,
};

export const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    addPrescription: (state, action: PayloadAction<Omit<Prescription, 'id'>>) => {
      const newRx: Prescription = {
        ...action.payload,
        id: `rx-${Date.now().toString().slice(-4)}`,
      };
      state.items.unshift(newRx);
    },
    updatePrescriptionStatus: (
      state,
      action: PayloadAction<{ id: string; status: Prescription['status'] }>
    ) => {
      const rx = state.items.find((r) => r.id === action.payload.id);
      if (rx) {
        rx.status = action.payload.status;
      }
    },
  },
});

export const { addPrescription, updatePrescriptionStatus } = prescriptionsSlice.actions;
export default prescriptionsSlice.reducer;
