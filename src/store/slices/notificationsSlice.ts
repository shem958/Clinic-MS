import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemNotification } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/lib/mockData';

interface NotificationsState {
  items: SystemNotification[];
}

const initialState: NotificationsState = {
  items: MOCK_NOTIFICATIONS,
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<SystemNotification, 'id' | 'timestamp' | 'read'>>) => {
      const newNotif: SystemNotification = {
        ...action.payload,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.items.unshift(newNotif);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
