'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
} from '@mui/material';
import {
  EventIcon,
  PeopleIcon,
  ScienceIcon,
  BillingIcon,
  PrescriptionIcon,
  AddIcon,
  PlayArrowIcon as PlayIcon,
  ArrowForwardIcon as ArrowForward,
  CheckIcon,
} from '@/components/common/Icons';

import { useAppSelector } from '@/store/hooks';
import { WorkflowStatusChip } from '@/components/common/WorkflowStatusChip';
import { AppointmentBookingForm } from '@/components/forms/AppointmentBookingForm';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { items: appointments } = useAppSelector((state) => state.appointments);
  const { items: patients } = useAppSelector((state) => state.patients);
  const { items: labRequests } = useAppSelector((state) => state.labRequests);
  const { items: prescriptions } = useAppSelector((state) => state.prescriptions);
  const { items: billing } = useAppSelector((state) => state.billing);

  const [bookingOpen, setBookingOpen] = useState(false);

  // Strict role-specific filtering: Patients ONLY see their own data
  const isPatient = currentUser.role === 'patient';

  const userAppointments = isPatient
    ? appointments.filter(
        (a) => a.patientId === currentUser.id || a.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : currentUser.role === 'doctor'
    ? appointments.filter((a) => a.doctorId === currentUser.id)
    : appointments;

  const userPrescriptions = isPatient
    ? prescriptions.filter(
        (r) => r.patientId === currentUser.id || r.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : prescriptions;

  const userLabs = isPatient
    ? labRequests.filter(
        (l) => l.patientId === currentUser.id || l.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : labRequests;

  const userInvoices = isPatient
    ? billing.filter(
        (b) => b.patientId === currentUser.id || b.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : billing;

  const pendingAppointments = userAppointments.filter(
    (a) => a.status === 'Registered' || a.status === 'In-Nurse-Triage' || a.status === 'Triaged-Pending-Doctor'
  );
  const pendingLabs = userLabs.filter((l) => l.status === 'Pending');
  const unpaidInvoices = userInvoices.filter((i) => i.status === 'Unpaid');

  const workflowSteps = [
    '1. Appointment Request',
    '2. Nurse Triage & Vitals',
    '3. Doctor Consultation',
    '4. Rx / Lab Orders',
    '5. Billing & Receipt',
  ];

  return (
    <Box>
      {/* Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #0F766E 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          borderRadius: 4,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar src={currentUser.avatar} sx={{ width: 56, height: 56, border: '2px solid #FFF' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Welcome back, {currentUser.name}!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {currentUser.title} — Active Perspective: <strong>{currentUser.role.toUpperCase()}</strong>
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
              {isPatient
                ? 'Your personal health portal: View your live queue status, physician notes, active prescriptions, lab reports, and billing receipts.'
                : 'Smart Clinic Management Portal with integrated Electronic Medical Records (EMR), live triage, doctor consultations, and billing.'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            {isPatient && (
              <Box display="flex" gap={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setBookingOpen(true)}
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: 'primary.dark',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#F1F5F9' },
                  }}
                >
                  Book Visit
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/appointments')}
                  sx={{
                    borderColor: '#FFFFFF',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  My Queue Status
                </Button>
              </Box>
            )}

            {currentUser.role === 'doctor' && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={() => router.push('/appointments')}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: 'primary.dark',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                Review Patient Queue
              </Button>
            )}

            {(currentUser.role === 'nurse' || currentUser.role === 'receptionist' || currentUser.role === 'admin') && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PeopleIcon />}
                onClick={() => router.push('/patients')}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: 'primary.dark',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                Patient EMR Directory
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Appointment Workflow Roadmap Visualizer */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EventIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Kenyan Clinical Pathway & Patient Journey
          </Typography>
        </Box>
        <Stepper activeStep={isPatient ? 1 : 2} alternativeLabel>
          {workflowSteps.map((label) => (
            <Step key={label} completed>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Role-Restricted Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '5px solid #0F766E' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 48, height: 48 }}>
                <EventIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isPatient ? 'MY APPOINTMENTS' : 'TOTAL APPOINTMENTS'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {userAppointments.length}
                </Typography>
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                  {pendingAppointments.length} Active in Queue
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '5px solid #2563EB' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 48, height: 48 }}>
                {isPatient ? <PrescriptionIcon /> : <PeopleIcon />}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isPatient ? 'MY PRESCRIPTIONS' : 'CLINIC PATIENT EMR'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {isPatient ? userPrescriptions.length : patients.length}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                  {isPatient
                    ? `${userPrescriptions.filter((r) => r.status === 'Issued').length} Active Prescriptions`
                    : '100% Medical Records Active'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '5px solid #D97706' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 48, height: 48 }}>
                <ScienceIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isPatient ? 'MY LAB RESULTS' : 'DIAGNOSTIC LABS'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {userLabs.length}
                </Typography>
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                  {pendingLabs.length} Pending Results
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '5px solid #DC2626' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.50', color: 'error.main', width: 48, height: 48 }}>
                <BillingIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isPatient ? 'MY INVOICES' : 'INVOICES & LEDGER'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {userInvoices.length}
                </Typography>
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                  {unpaidInvoices.length} Unpaid Invoices
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid Section */}
      <Grid container spacing={3}>
        {/* Recent Schedule / Queue */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isPatient ? 'My Personal Appointments' : 'Clinic Appointment Queue'}
              </Typography>
              <Button size="small" endIcon={<ArrowForward />} onClick={() => router.push('/appointments')}>
                {isPatient ? 'Check My Queue Position' : 'View All'}
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {userAppointments.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography color="text.secondary" mb={2}>
                  No appointments scheduled for your profile.
                </Typography>
                {isPatient && (
                  <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setBookingOpen(true)}>
                    Schedule an Appointment
                  </Button>
                )}
              </Box>
            ) : (
              userAppointments.slice(0, 4).map((apt) => (
                <Paper
                  key={apt.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.dark', fontWeight: 700 }}>
                      {apt.patientName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {apt.patientName} — {apt.doctorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {apt.date} at {apt.timeSlot} | {apt.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                        Reason: {apt.reason}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <WorkflowStatusChip status={apt.status} />
                    {currentUser.role === 'doctor' && apt.status === 'Approved' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayIcon />}
                        sx={{ mt: 1, display: 'block' }}
                        onClick={() => router.push(`/consultation/${apt.id}`)}
                      >
                        Start Visit
                      </Button>
                    )}
                  </Box>
                </Paper>
              ))
            )}
          </Paper>
        </Grid>

        {/* Quick Action Panel */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              {isPatient ? 'My Patient Portal Actions' : 'Clinical Actions'}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={() => (isPatient ? router.push('/appointments') : setBookingOpen(true))}
                  sx={{ p: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {isPatient ? 'My Queue Status' : 'Request Visit'}
                </Button>
              </Grid>

              {isPatient ? (
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BillingIcon />}
                    onClick={() => router.push('/billing')}
                    sx={{ p: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    My Invoices
                  </Button>
                </Grid>
              ) : (
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => router.push('/patients')}
                    sx={{ p: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    Patient EMR
                  </Button>
                </Grid>
              )}

              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PrescriptionIcon />}
                  onClick={() => router.push('/prescriptions')}
                  sx={{ p: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {isPatient ? 'My Prescriptions' : 'Prescriptions'}
                </Button>
              </Grid>

              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ScienceIcon />}
                  onClick={() => router.push('/labs')}
                  sx={{ p: 1.5, justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {isPatient ? 'My Lab Results' : 'Lab Reports'}
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                {isPatient ? 'My Recent Prescriptions' : 'Recent Prescriptions Issued'}
              </Typography>
              {userPrescriptions.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  No active prescriptions on file.
                </Typography>
              ) : (
                userPrescriptions.slice(0, 2).map((rx) => (
                  <Paper key={rx.id} variant="outlined" sx={{ p: 1.5, mb: 1, bgcolor: '#FAF5FF', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {rx.date} | Prescribed by: <strong>{rx.doctorName}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, my: 0.5 }}>
                      {rx.medications.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                    </Typography>
                    <WorkflowStatusChip status={rx.status} />
                  </Paper>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Appointment Booking Modal */}
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Medical Appointment</DialogTitle>
        <DialogContent dividers>
          <AppointmentBookingForm onSuccess={() => setBookingOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
