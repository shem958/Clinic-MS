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
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { MedicalIcon, CheckIcon, EventIcon } from '@/components/common/Icons';
import { useAppSelector } from '@/store/hooks';
import { NurseTriageForm } from '@/components/forms/NurseTriageForm';
import { Appointment } from '@/types';

export default function NurseTriagePage() {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { items: appointments } = useAppSelector((state) => state.appointments);
  const { records: triageRecords } = useAppSelector((state) => state.triage);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Queue: appointments waiting for nurse triage
  const pendingTriage = appointments.filter(
    (a) => a.status === 'Registered' || a.status === 'In-Nurse-Triage'
  );
  const triagedQueue = appointments.filter(
    (a) => a.status === 'Triaged-Pending-Doctor' || a.status === 'In-Consultation' || a.status === 'Completed'
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Nurse Triage Station & Pre-Doctor Vitals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In Kenya healthcare clinics, all patients must undergo Nurse Triage (BP, Temp, Height, Weight, SpO2) before seeing a Doctor.
          </Typography>
        </Box>
        <Chip
          label={`Duty Nurse: ${currentUser.name}`}
          color="primary"
          sx={{ fontWeight: 700, p: 1 }}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <CardContent>
              <Typography variant="caption" color="error.dark" sx={{ fontWeight: 700 }}>
                CRITICAL EMERGENCY CASES
              </Typography>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 800 }}>
                {triageRecords.filter((r) => r.priority === 'Emergency').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requires immediate physician intervention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#FEFCE8', border: '1px solid #FDE047' }}>
            <CardContent>
              <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 700 }}>
                AWAITING NURSE TRIAGE
              </Typography>
              <Typography variant="h4" color="warning.dark" sx={{ fontWeight: 800 }}>
                {pendingTriage.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Patients in Reception Waiting Lounge
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#F0FDF4', border: '1px solid #86EFAC' }}>
            <CardContent>
              <Typography variant="caption" color="success.dark" sx={{ fontWeight: 700 }}>
                TRIAGED & PASSED TO DOCTOR
              </Typography>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 800 }}>
                {triagedQueue.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Vitals captured & ready in Doctor Queue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 1. Triage Queue Awaiting Nurse */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
          1. Reception Queue Awaiting Nurse Triage ({pendingTriage.length})
        </Typography>

        {pendingTriage.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            No patients waiting in Nurse Triage lounge.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Type / Priority</TableCell>
                <TableCell>Doctor Assigned</TableCell>
                <TableCell>Arrival Time</TableCell>
                <TableCell>Reason for Visit</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingTriage.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{apt.patientName}</TableCell>
                  <TableCell>
                    <Chip
                      label={apt.type}
                      size="small"
                      color={apt.type === 'Walk-In Emergency' ? 'error' : 'info'}
                    />
                  </TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell>{apt.timeSlot}</TableCell>
                  <TableCell>{apt.reason}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color={apt.type === 'Walk-In Emergency' ? 'error' : 'primary'}
                      size="small"
                      startIcon={<MedicalIcon />}
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      {apt.type === 'Walk-In Emergency' ? 'Stabilize & Triage' : 'Perform Triage'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* 2. Completed Triage Logs */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          2. Recent Nurse Triage Logbook
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>BP (mmHg)</TableCell>
              <TableCell>Temp (°C)</TableCell>
              <TableCell>Height / Weight</TableCell>
              <TableCell>SpO2 & Pulse</TableCell>
              <TableCell>Priority Tag</TableCell>
              <TableCell>Triaged By</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {triageRecords.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell sx={{ fontWeight: 700 }}>{rec.patientName}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  {rec.bpSystolic} / {rec.bpDiastolic}
                </TableCell>
                <TableCell>{rec.temperature} °C</TableCell>
                <TableCell>
                  {rec.heightCm} cm | {rec.weightKg} kg
                </TableCell>
                <TableCell>
                  {rec.spo2}% | {rec.pulseRate} bpm
                </TableCell>
                <TableCell>
                  <Chip
                    label={rec.priority}
                    size="small"
                    color={
                      rec.priority === 'Emergency'
                        ? 'error'
                        : rec.priority === 'Urgent'
                        ? 'warning'
                        : 'success'
                    }
                  />
                </TableCell>
                <TableCell>{rec.nurseName}</TableCell>
                <TableCell>
                  <Chip label={rec.status} size="small" variant="outlined" color="success" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Triage Form Dialog */}
      <Dialog
        open={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Nurse Triage Assessment & Vitals Entry</DialogTitle>
        <DialogContent dividers>
          {selectedAppointment && (
            <NurseTriageForm
              appointment={selectedAppointment}
              onSuccess={() => setSelectedAppointment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
