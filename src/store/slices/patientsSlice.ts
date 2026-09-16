import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Patient } from '@/types';
import { MOCK_PATIENTS } from '@/lib/mockData';

interface PatientsState {
  items: Patient[];
  selectedPatientId: string | null;
}

const initialState: PatientsState = {
  items: MOCK_PATIENTS,
  selectedPatientId: 'pat-1',
};

export const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    addPatient: (state, action: PayloadAction<Omit<Patient, 'id' | 'mrn'>>) => {
      const id = `pat-${Date.now().toString().slice(-4)}`;
      const mrn = `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const activationCode =
        action.payload.activationCode || `ACT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPatient: Patient = {
        ...action.payload,
        id,
        mrn,
        activationCode,
        isAccountClaimed: action.payload.isAccountClaimed ?? false,
      };
      state.items.unshift(newPatient);
    },
    claimPatientAccount: (
      state,
      action: PayloadAction<{
        patientId: string;
        password: string;
        nationalId?: string;
        email?: string;
        phone?: string;
      }>
    ) => {
      const p = state.items.find((pat) => pat.id === action.payload.patientId);
      if (p) {
        p.isAccountClaimed = true;
        p.password = action.payload.password;
        if (action.payload.nationalId) p.nationalId = action.payload.nationalId;
        if (action.payload.email) p.email = action.payload.email;
        if (action.payload.phone) p.phone = action.payload.phone;
      }
    },
    updatePatient: (state, action: PayloadAction<Patient>) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
    },
    setSelectedPatient: (state, action: PayloadAction<string | null>) => {
      state.selectedPatientId = action.payload;
    },
  },
});

export const {
  addPatient,
  claimPatientAccount,
  updatePatient,
  setSelectedPatient,
} = patientsSlice.actions;

export default patientsSlice.reducer;
