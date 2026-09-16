import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LabRequest, LabTestItem } from '@/types';
import { MOCK_LAB_REQUESTS } from '@/lib/mockData';

interface LabRequestsState {
  items: LabRequest[];
}

const initialState: LabRequestsState = {
  items: MOCK_LAB_REQUESTS,
};

export const labRequestsSlice = createSlice({
  name: 'labRequests',
  initialState,
  reducers: {
    addLabRequest: (state, action: PayloadAction<Omit<LabRequest, 'id'>>) => {
      const newLab: LabRequest = {
        ...action.payload,
        id: `lab-${Date.now().toString().slice(-4)}`,
      };
      state.items.unshift(newLab);
    },
    updateLabResults: (
      state,
      action: PayloadAction<{
        labRequestId: string;
        labTechNotes?: string;
        tests: LabTestItem[];
      }>
    ) => {
      const lab = state.items.find((l) => l.id === action.payload.labRequestId);
      if (lab) {
        lab.tests = action.payload.tests;
        lab.labTechNotes = action.payload.labTechNotes;
        lab.status = 'Completed';
        lab.completedDate = new Date().toISOString().split('T')[0];
      }
    },
    updateLabStatus: (
      state,
      action: PayloadAction<{ id: string; status: LabRequest['status'] }>
    ) => {
      const lab = state.items.find((l) => l.id === action.payload.id);
      if (lab) {
        lab.status = action.payload.status;
      }
    },
  },
});

export const { addLabRequest, updateLabResults, updateLabStatus } = labRequestsSlice.actions;
export default labRequestsSlice.reducer;
