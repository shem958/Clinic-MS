'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Paper, Grid, Button, Avatar, Chip, Alert, Divider } from '@mui/material';
import { ArrowBackIcon, MedicalIcon as MedicalServices } from '@/components/common/Icons';

import { useAppSelector } from '@/store/hooks';
import { ConsultationForm } from '@/components/forms/ConsultationForm';

export default function DoctorConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const { items: appointments } = useAppSelector((state) => state.appointments);
  const { items: patients } = useAppSelector((state) => state.patients);

  const appointment = appointments.find((a) => a.id === appointmentId) || appointments[0];
  const patient = patients.find((p) => p.id === appointment?.patientId) || patients[0];

  if (!appointment) {
    return (
      <Box p={4}>
        <Alert severity="error">Appointment not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/appointments')} sx={{ mb: 2 }}>
        Back to Appointments Queue
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Active Doctor Consultation & Medical Entry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Record vitals, clinical evaluation, issue electronic prescriptions, order labs, and trigger automated billing.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Patient Summary Side Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 90, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800 }}>
                {patient.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {patient.name}
                </Typography>
                <Chip label={patient.mrn} size="small" color="primary" />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
              Patient Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '0.875rem' }}>
              <div>Age / Gender: <strong>{patient.age} yrs | {patient.gender}</strong></div>
              <div>Blood Type: <strong>{patient.bloodGroup}</strong></div>
              <div>Phone: <strong>{patient.phone}</strong></div>
              <div>Insurance: <strong>{patient.insurance.provider}</strong></div>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700, mb: 1 }}>
              Known Allergies
            </Typography>
            {patient.allergies.length === 0 ? (
              <Typography variant="caption">None reported.</Typography>
            ) : (
              patient.allergies.map((alg) => (
                <Chip key={alg} label={alg} color="error" size="small" variant="outlined" sx={{ mr: 0.5, mt: 0.5 }} />
              ))
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Reason for Today's Visit
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
              <Typography variant="body2">{appointment.reason}</Typography>
            </Paper>
          </Paper>
        </Grid>

        {/* Doctor Consultation Form Workspace */}
        <Grid item xs={12} md={8}>
          <ConsultationForm appointment={appointment} onSuccess={() => router.push('/appointments')} />
        </Grid>
      </Grid>
    </Box>
  );
}
