'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import { CreditCardIcon as CreditCard, CheckCircleIcon as CheckCircle } from '@/components/common/Icons';


import { useAppDispatch } from '@/store/hooks';
import { markInvoiceAsPaid } from '@/store/slices/billingSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { BillingInvoice } from '@/types';

interface BillingFormProps {
  invoice: BillingInvoice;
  onSuccess?: () => void;
}

export const BillingForm: React.FC<BillingFormProps> = ({ invoice, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [paymentMethod, setPaymentMethod] = useState<BillingInvoice['paymentMethod']>('Credit Card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(
      markInvoiceAsPaid({
        id: invoice.id,
        paymentMethod,
      })
    );

    dispatch(
      addNotification({
        userId: invoice.patientId,
        roleTarget: 'patient',
        title: 'Payment Received',
        message: `Invoice ${invoice.invoiceNumber} ($${invoice.totalAmount.toFixed(2)}) marked as Paid via ${paymentMethod}.`,
        type: 'success',
        link: '/billing',
      })
    );

    if (onSuccess) onSuccess();
  };

  return (
    <Box component="form" onSubmit={handlePay} sx={{ mt: 1 }}>
      <Paper sx={{ p: 2.5, mb: 3, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <Typography variant="h6" color="success.dark" sx={{ fontWeight: 700 }}>
          Invoice Summary #{invoice.invoiceNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Patient: <strong>{invoice.patientName}</strong> | Date: {invoice.date}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {invoice.items.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
            <Typography variant="body2">{item.description}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ${item.cost.toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', fontSize: '0.875rem' }}>
          <span>Subtotal:</span>
          <span>${invoice.subtotal.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main', fontSize: '0.875rem' }}>
          <span>Insurance Coverage Discount:</span>
          <span>-${invoice.insuranceDiscount.toFixed(2)}</span>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', fontSize: '0.875rem' }}>
          <span>Tax (7%):</span>
          <span>+${invoice.tax.toFixed(2)}</span>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Total Due:
          </Typography>
          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
            ${invoice.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Paper>

      <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
        Payment Processing Details
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
          >
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Insurance Direct">Insurance Direct Billing</MenuItem>
            <MenuItem value="Cash">Cash at Counter</MenuItem>
            <MenuItem value="Bank Transfer">Bank Wire Transfer</MenuItem>
          </TextField>
        </Grid>

        {paymentMethod === 'Credit Card' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField fullWidth label="Expiry Date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField fullWidth label="CVV" value="888" type="password" />
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="success" size="large" type="submit" startIcon={<CheckCircle />}>
          Process Payment (${invoice.totalAmount.toFixed(2)})
        </Button>
      </Box>
    </Box>
  );
};
