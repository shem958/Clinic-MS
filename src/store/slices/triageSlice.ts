import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NurseTriageRecord } from '@/types';
import { MOCK_TRIAGE_RECORDS } from '@/lib/mockData';

interface TriageState {
  records: NurseTriageRecord[];
}

const initialState: TriageState = {
  records: MOCK_TRIAGE_RECORDS,
};

export const triageSlice = createSlice({
  name: 'triage',
  initialState,
  reducers: {
    addTriageRecord: (state, action: PayloadAction<Omit<NurseTriageRecord, 'id' | 'timestamp' | 'status'>>) => {
      const newRecord: NurseTriageRecord = {
        ...action.payload,
        id: `trg-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        status: 'Triaged',
      };
      state.records.unshift(newRecord);
    },
    transferToDoctor: (state, action: PayloadAction<string>) => {
      const rec = state.records.find((r) => r.id === action.payload);
      if (rec) {
        rec.status = 'Transferred-To-Doctor';
      }
    },
  },
});

export const { addTriageRecord, transferToDoctor } = triageSlice.actions;
export default triageSlice.reducer;
