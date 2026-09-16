import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from '@/types';
import { MOCK_USERS } from '@/lib/mockData';

interface AuthState {
  currentUser: User;
  availableUsers: User[];
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  currentUser: MOCK_USERS[0], // Default Sarah Jenkins (Patient)
  availableUsers: MOCK_USERS,
  isAuthenticated: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User }>) => {
      state.currentUser = action.payload.user;
      state.isAuthenticated = true;
      // Ensure user is in availableUsers list
      const exists = state.availableUsers.some((u) => u.id === action.payload.user.id);
      if (!exists) {
        state.availableUsers.push(action.payload.user);
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      const match = state.availableUsers.find((u) => u.role === action.payload);
      if (match) {
        state.currentUser = match;
        state.isAuthenticated = true;
      }
    },
    switchUser: (state, action: PayloadAction<string>) => {
      const match = state.availableUsers.find((u) => u.id === action.payload);
      if (match) {
        state.currentUser = match;
        state.isAuthenticated = true;
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
      const idx = state.availableUsers.findIndex((u) => u.id === state.currentUser.id);
      if (idx !== -1) {
        state.availableUsers[idx] = state.currentUser;
      }
    },
    registerAndLoginPatient: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        email: string;
        phone: string;
        password?: string;
      }>
    ) => {
      const newPatientUser: User = {
        id: action.payload.id,
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
        role: 'patient',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        title: 'Patient (Verified)',
        password: action.payload.password,
      };

      const existingIdx = state.availableUsers.findIndex((u) => u.id === newPatientUser.id);
      if (existingIdx !== -1) {
        state.availableUsers[existingIdx] = newPatientUser;
      } else {
        state.availableUsers.push(newPatientUser);
      }
      state.currentUser = newPatientUser;
      state.isAuthenticated = true;
    },
  },
});

export const {
  login,
  logout,
  switchRole,
  switchUser,
  updateUserProfile,
  registerAndLoginPatient,
} = authSlice.actions;

export default authSlice.reducer;
