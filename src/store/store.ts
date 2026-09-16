import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import patientsReducer from './slices/patientsSlice';
import consultationsReducer from './slices/consultationsSlice';
import prescriptionsReducer from './slices/prescriptionsSlice';
import labRequestsReducer from './slices/labRequestsSlice';
import billingReducer from './slices/billingSlice';
import notificationsReducer from './slices/notificationsSlice';
import triageReducer from './slices/triageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer,
    patients: patientsReducer,
    consultations: consultationsReducer,
    prescriptions: prescriptionsReducer,
    labRequests: labRequestsReducer,
    billing: billingReducer,
    notifications: notificationsReducer,
    triage: triageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
