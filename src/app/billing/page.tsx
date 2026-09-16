'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Avatar,
  Alert,
} from '@mui/material';
import {
  BillingIcon as Receipt,
  CreditCardIcon as Payment,
  CheckCircleIcon as CheckCircle,
  AddIcon,
  CheckIcon,
} from '@/components/common/Icons';

import { useAppSelector } from '@/store/hooks';
import { WorkflowStatusChip } from '@/components/common/WorkflowStatusChip';
import { BillingForm } from '@/components/forms/BillingForm';
import { BillingInvoice } from '@/types';

export default function BillingPage() {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { items: billing } = useAppSelector((state) => state.billing);

  const [tabValue, setTabValue] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  const isPatient = currentUser.role === 'patient';

  // Strict isolation: patients only see their own billing invoices
  const userInvoices = isPatient
    ? billing.filter(
        (b) =>
          b.patientId === currentUser.id ||
          b.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : billing;

  const filteredInvoices = userInvoices.filter((inv) => {
    return tabValue === 'All' ? true : inv.status === tabValue;
  });

  const totalOutstanding = userInvoices
    .filter((i) => i.status === 'Unpaid')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const totalPaid = userInvoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {isPatient ? 'My Invoices & Payment Ledger' : 'Billing & Clinic Financial Ledger'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isPatient
              ? 'View your itemized consultation fees, SHA insurance copay deductions, and payment receipts.'
              : 'Itemized clinical charges, insurance copay deductions, and payment processing.'}
          </Typography>
        </Box>

        {!isPatient &&
          (currentUser.role === 'receptionist' || currentUser.role === 'admin') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              onClick={() => setCreateInvoiceOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              Generate New Invoice
            </Button>
          )}
      </Box>

      {/* Patient Financial Summary Metric Cards */}
      {isPatient && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '5px solid #DC2626' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  OUTSTANDING BALANCE DUE
                </Typography>
                <Typography variant="h5" fontWeight={800} color="error.main" my={0.5}>
                  KES {(totalOutstanding * 130).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Payable via M-Pesa or Debit Card
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '5px solid #16A34A' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  TOTAL PAID RECEIPTS
                </Typography>
                <Typography variant="h5" fontWeight={800} color="success.main" my={0.5}>
                  KES {(totalPaid * 130).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Settled clinical services & consultations
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '5px solid #2563EB' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  INSURANCE RECOGNITION
                </Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main" my={0.5}>
                  NHIF / SHA Kenya Active
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automated Copay Waiver Applied
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter Tabs */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="All Invoices" value="All" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Unpaid Due" value="Unpaid" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Paid Receipts" value="Paid" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* Invoices List */}
      <Grid container spacing={3}>
        {filteredInvoices.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Receipt sx={{ fontSize: 48, color: 'primary.light', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {isPatient ? 'No Invoices Found' : 'No Invoices Recorded'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isPatient
                  ? 'There are currently no billing statements or payment receipts registered under your patient account.'
                  : 'No invoices match the selected status category.'}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredInvoices.map((inv) => (
            <Grid item xs={12} key={inv.id}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Receipt color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Invoice #{inv.invoiceNumber} {isPatient ? '' : `— Patient: ${inv.patientName}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Issued: {inv.date} | Due Date: {inv.dueDate}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WorkflowStatusChip status={inv.status} />
                    {inv.status === 'Unpaid' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Payment />}
                        onClick={() => setSelectedInvoice(inv)}
                        sx={{ fontWeight: 700 }}
                      >
                        {isPatient ? 'Pay with M-Pesa / Card' : 'Record Payment'}
                      </Button>
                    )}
                  </Box>
                </Box>

                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Item Description</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Standard Fee
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inv.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{item.description}</TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">KES {(item.cost * 130).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} align="right">
                        Subtotal:
                      </TableCell>
                      <TableCell align="right">KES {(inv.subtotal * 130).toLocaleString()}</TableCell>
                    </TableRow>
                    {inv.insuranceDiscount > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                          SHA / NHIF Insurance Coverage Discount:
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>
                          -KES {(inv.insuranceDiscount * 130).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ bgcolor: '#FAF5FF' }}>
                      <TableCell colSpan={2} align="right" sx={{ fontWeight: 800 }}>
                        Final Payable Balance:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.dark', fontSize: '1rem' }}>
                        KES {(inv.totalAmount * 130).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Payment Processing Modal */}
      <Dialog
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isPatient ? 'Patient Online Checkout' : 'Process Patient Invoice Payment'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedInvoice && (
            <BillingForm
              invoice={selectedInvoice}
              onSuccess={() => setSelectedInvoice(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
