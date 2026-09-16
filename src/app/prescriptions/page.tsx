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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  SearchIcon,
  PrescriptionIcon as LocalPharmacy,
  CheckCircleIcon as CheckCircle,
} from '@/components/common/Icons';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePrescriptionStatus } from '@/store/slices/prescriptionsSlice';
import { WorkflowStatusChip } from '@/components/common/WorkflowStatusChip';

export default function PrescriptionsPage() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { items: prescriptions } = useAppSelector((state) => state.prescriptions);

  const [searchTerm, setSearchTerm] = useState('');

  const isPatient = currentUser.role === 'patient';

  // Strict isolation: patients only see their own prescriptions
  const userPrescriptions = isPatient
    ? prescriptions.filter(
        (r) =>
          r.patientId === currentUser.id ||
          r.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : prescriptions;

  const filteredRx = userPrescriptions.filter((rx) => {
    return (
      rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.medications.some((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleFulfill = (id: string) => {
    dispatch(updatePrescriptionStatus({ id, status: 'Dispensed' }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {isPatient ? 'My Prescriptions & Pharmacy Orders' : 'Electronic Prescriptions (Rx)'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isPatient
              ? 'Review your prescribed medications, dosage schedules, duration, and pharmacy dispensing status.'
              : 'Manage medication orders, dosage schedules, and pharmacy fulfillment status.'}
          </Typography>
        </Box>
      </Box>

      {/* Search Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={
            isPatient
              ? 'Search your medications or prescribing doctor...'
              : 'Search by medication name, patient, or doctor...'
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Prescriptions List */}
      <Grid container spacing={3}>
        {filteredRx.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <LocalPharmacy sx={{ fontSize: 48, color: 'primary.light', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {isPatient ? 'No Prescriptions On File' : 'No Prescriptions Found'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isPatient
                  ? 'You currently have no prescribed medications registered under your medical record.'
                  : 'No medication orders matched your search criteria.'}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredRx.map((rx) => (
            <Grid item xs={12} key={rx.id}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocalPharmacy color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Prescription #{rx.id} {isPatient ? '' : `— Patient: ${rx.patientName}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prescribed by <strong>{rx.doctorName}</strong> on {rx.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WorkflowStatusChip status={rx.status} />
                    {!isPatient &&
                      (currentUser.role === 'nurse' ||
                        currentUser.role === 'doctor' ||
                        currentUser.role === 'admin') &&
                      rx.status === 'Issued' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => handleFulfill(rx.id)}
                        >
                          Dispense Pharmacy Order
                        </Button>
                      )}
                  </Box>
                </Box>

                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Medication</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dosage</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Instructions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rx.medications.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>{med.duration}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          {med.instructions}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
