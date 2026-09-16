import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BillingInvoice } from '@/types';
import { MOCK_BILLING } from '@/lib/mockData';

interface BillingState {
  items: BillingInvoice[];
}

const initialState: BillingState = {
  items: MOCK_BILLING,
};

export const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Omit<BillingInvoice, 'id' | 'invoiceNumber'>>) => {
      const id = `inv-${Date.now().toString().slice(-4)}`;
      const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvoice: BillingInvoice = {
        ...action.payload,
        id,
        invoiceNumber,
      };
      state.items.unshift(newInvoice);
    },
    markInvoiceAsPaid: (
      state,
      action: PayloadAction<{ id: string; paymentMethod: BillingInvoice['paymentMethod'] }>
    ) => {
      const inv = state.items.find((i) => i.id === action.payload.id);
      if (inv) {
        inv.status = 'Paid';
        inv.paymentMethod = action.payload.paymentMethod;
        inv.paidAt = new Date().toISOString();
      }
    },
  },
});

export const { addInvoice, markInvoiceAsPaid } = billingSlice.actions;
export default billingSlice.reducer;
