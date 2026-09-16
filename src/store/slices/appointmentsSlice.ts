import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment, AppointmentStatus } from '@/types';
import { MOCK_APPOINTMENTS } from '@/lib/mockData';

interface AppointmentsState {
  items: Appointment[];
  selectedAppointmentId: string | null;
}

const initialState: AppointmentsState = {
  items: MOCK_APPOINTMENTS,
  selectedAppointmentId: null,
};

export const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    addAppointment: (
      state,
      action: PayloadAction<Omit<Appointment, 'id' | 'createdAt' | 'status'> & { status?: AppointmentStatus }>
    ) => {
      const newApt: Appointment = {
        status: 'Registered',
        ...action.payload,
        id: `apt-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };
      state.items.unshift(newApt);
    },
    updateAppointmentStatus: (
      state,
      action: PayloadAction<{ id: string; status: AppointmentStatus; notes?: string }>
    ) => {
      const apt = state.items.find((a) => a.id === action.payload.id);
      if (apt) {
        apt.status = action.payload.status;
        if (action.payload.notes) {
          apt.notes = action.payload.notes;
        }
      }
    },
    setSelectedAppointment: (state, action: PayloadAction<string | null>) => {
      state.selectedAppointmentId = action.payload;
    },
  },
});

export const { addAppointment, updateAppointmentStatus, setSelectedAppointment } =
  appointmentsSlice.actions;
export default appointmentsSlice.reducer;
