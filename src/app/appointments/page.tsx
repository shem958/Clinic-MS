'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  AddIcon,
  SearchIcon,
  CheckCircleIcon as ApproveIcon,
  CancelIcon as RejectIcon,
  PlayArrowIcon as StartIcon,
  VisibilityIcon as ViewIcon,
  EventIcon,
  HospitalIcon,
  ScienceIcon,
  CheckIcon,
} from '@/components/common/Icons';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAppointmentStatus } from '@/store/slices/appointmentsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { WorkflowStatusChip } from '@/components/common/WorkflowStatusChip';
import { AppointmentBookingForm } from '@/components/forms/AppointmentBookingForm';

export default function AppointmentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { items: appointments } = useAppSelector((state) => state.appointments);

  const [tabValue, setTabValue] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);

  const isPatient = currentUser.role === 'patient';

  // Active queue across the clinic for patients waiting for care
  const activeQueue = appointments.filter(
    (a) =>
      a.status === 'Registered' ||
      a.status === 'In-Nurse-Triage' ||
      a.status === 'Triaged-Pending-Doctor' ||
      a.status === 'Approved' ||
      a.status === 'In-Consultation'
  );

  // Patient's active appointment in queue
  const myActiveAppointment = isPatient
    ? activeQueue.find(
        (a) =>
          a.patientId === currentUser.id ||
          a.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : null;

  // Patient's own appointments history (only their own records)
  const myAllAppointments = isPatient
    ? appointments.filter(
        (a) =>
          a.patientId === currentUser.id ||
          a.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : [];

  // Calculate live position in queue
  const myPositionIndex = myActiveAppointment
    ? activeQueue.findIndex((a) => a.id === myActiveAppointment.id)
    : -1;
  const myQueueNumber = myPositionIndex !== -1 ? myPositionIndex + 1 : null;
  const patientsAhead = myPositionIndex !== -1 ? myPositionIndex : 0;
  const estimatedWaitMinutes = Math.max(5, patientsAhead * 15);

  // Staff-specific appointments filtering
  const staffAppointments =
    currentUser.role === 'doctor'
      ? appointments.filter((a) => a.doctorId === currentUser.id)
      : appointments;

  const filteredStaffAppointments = staffAppointments.filter((apt) => {
    const matchesTab = tabValue === 'All' ? true : apt.status === tabValue;
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = (id: string, patientId: string, patientName: string) => {
    dispatch(
      updateAppointmentStatus({
        id,
        status: 'Approved',
        notes: `Approved by ${currentUser.name}.`,
      })
    );
    dispatch(
      addNotification({
        userId: patientId,
        roleTarget: 'patient',
        title: 'Appointment Approved!',
        message: `Your appointment request with ${currentUser.name} has been approved.`,
        type: 'success',
        link: '/appointments',
      })
    );
  };

  const handleReject = (id: string, patientId: string) => {
    dispatch(
      updateAppointmentStatus({
        id,
        status: 'Rejected',
        notes: `Declined by clinic due to schedule conflict.`,
      })
    );
    dispatch(
      addNotification({
        userId: patientId,
        roleTarget: 'patient',
        title: 'Appointment Declined',
        message: `Your appointment request could not be accommodated at this time.`,
        type: 'error',
        link: '/appointments',
      })
    );
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'patientName',
      headerName: 'Patient Name',
      width: 170,
      renderCell: (params) => <strong>{params.value}</strong>,
    },
    { field: 'doctorName', headerName: 'Doctor', width: 170 },
    { field: 'specialty', headerName: 'Specialty', width: 140 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'timeSlot', headerName: 'Time', width: 110 },
    { field: 'type', headerName: 'Type', width: 110 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => <WorkflowStatusChip status={params.value} />,
    },
    { field: 'reason', headerName: 'Reason for Visit', width: 220 },
    {
      field: 'actions',
      headerName: 'Workflow Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => {
        const apt = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {(currentUser.role === 'doctor' ||
              currentUser.role === 'nurse' ||
              currentUser.role === 'receptionist' ||
              currentUser.role === 'admin') &&
              apt.status === 'Approved' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<StartIcon />}
                  onClick={() => router.push(`/consultation/${apt.id}`)}
                >
                  Start Visit
                </Button>
              )}

            {apt.status === 'Completed' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => router.push(`/patients/${apt.patientId}`)}
              >
                View EMR
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  // ==========================================
  // PATIENT VIEW: ONLY POSITION & PERSONAL APPOINTMENT
  // ==========================================
  if (isPatient) {
    const queueSteps = [
      'Reception Intake',
      'Nurse Triage Vitals',
      'Doctor Consultation',
      'Pharmacy & Discharge',
    ];

    let currentStepIndex = 0;
    if (myActiveAppointment) {
      if (myActiveAppointment.status === 'Registered') currentStepIndex = 0;
      else if (myActiveAppointment.status === 'In-Nurse-Triage') currentStepIndex = 1;
      else if (myActiveAppointment.status === 'Triaged-Pending-Doctor') currentStepIndex = 2;
      else if (myActiveAppointment.status === 'In-Consultation') currentStepIndex = 2;
      else if (myActiveAppointment.status === 'Completed') currentStepIndex = 3;
    }

    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
              My Clinic Visit & Live Queue Position
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personalized patient queue tracker. Monitor your live position, estimated wait time, and clinical stage.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => setBookingOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            Request New Visit
          </Button>
        </Box>

        {/* Active Queue Position Card */}
        {myActiveAppointment ? (
          <Paper
            elevation={2}
            sx={{
              p: 3.5,
              mb: 4,
              borderRadius: 4,
              border: '2px solid #0F766E',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              {/* Token Display */}
              <Grid item xs={12} md={4} sx={{ textAlign: 'center', borderRight: { md: '1px solid #E2E8F0' } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={1}>
                  YOUR CURRENT QUEUE TOKEN
                </Typography>
                <Box
                  sx={{
                    my: 1.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 24px rgba(15, 118, 110, 0.35)',
                  }}
                >
                  <Typography variant="h3" fontWeight={900}>
                    #{myQueueNumber}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} color="primary.dark">
                  {patientsAhead === 0 ? 'You Are Next In Line!' : `${patientsAhead} Patient(s) Ahead`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated Wait: <strong>~{estimatedWaitMinutes} minutes</strong>
                </Typography>
              </Grid>

              {/* Appointment Details */}
              <Grid item xs={12} md={8}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <HospitalIcon color="primary" />
                    <Typography variant="h6" fontWeight={800}>
                      {myActiveAppointment.doctorName}
                    </Typography>
                    <Chip label={myActiveAppointment.specialty} size="small" variant="outlined" color="primary" />
                  </Box>
                  <WorkflowStatusChip status={myActiveAppointment.status} />
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Visit Date: <strong>{myActiveAppointment.date}</strong> | Slot: <strong>{myActiveAppointment.timeSlot}</strong> | Type: <strong>{myActiveAppointment.type}</strong>
                </Typography>

                <Alert severity={patientsAhead === 0 ? 'success' : 'info'} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {patientsAhead === 0
                      ? 'Doctor consultation is ready for you. Please proceed towards the physician consultation suite.'
                      : `You are in position #${myQueueNumber}. Please relax in the patient waiting area. The doctor will call your token shortly.`}
                  </Typography>
                </Alert>

                {/* Progress Stepper */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
                    CLINICAL VISIT PROGRESSION
                  </Typography>
                  <Stepper activeStep={currentStepIndex} alternativeLabel>
                    {queueSteps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </Grid>
            </Grid>

            {/* Nurse Triage Vitals Preview (If triaged) */}
            {myActiveAppointment.triageRecord && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #CBD5E1' }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={1}>
                  🩺 Recorded Nurse Triage Vitals (by {myActiveAppointment.triageRecord.nurseName}):
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="text.secondary">Blood Pressure</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {myActiveAppointment.triageRecord.bpSystolic}/{myActiveAppointment.triageRecord.bpDiastolic} mmHg
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="text.secondary">Temperature</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {myActiveAppointment.triageRecord.temperature}°C
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="text.secondary">Blood Oxygen (SpO2)</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {myActiveAppointment.triageRecord.spo2}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="text.secondary">Height & Weight</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {myActiveAppointment.triageRecord.heightCm} cm / {myActiveAppointment.triageRecord.weightKg} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="caption" color="text.secondary">Triage Tag</Typography>
                    <Chip label={myActiveAppointment.triageRecord.priority} size="small" color="primary" />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 50, color: 'primary.light', mb: 1 }} />
            <Typography variant="h6" fontWeight={700} mb={0.5}>
              No Active Appointment in Today's Queue
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              You currently have no check-in or ongoing consultation waiting in the clinic lounge queue.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBookingOpen(true)}>
              Schedule an Appointment
            </Button>
          </Paper>
        )}

        {/* Patient's Own Past Appointments Table */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            My Previous Visit History
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Appointment ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Specialty</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myAllAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No prior appointment history recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  myAllAppointments.map((apt) => (
                    <TableRow key={apt.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{apt.id}</TableCell>
                      <TableCell>{apt.doctorName}</TableCell>
                      <TableCell>{apt.specialty}</TableCell>
                      <TableCell>
                        {apt.date} at {apt.timeSlot}
                      </TableCell>
                      <TableCell>{apt.reason}</TableCell>
                      <TableCell>
                        <WorkflowStatusChip status={apt.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Booking Dialog */}
        <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Request Medical Appointment</DialogTitle>
          <DialogContent dividers>
            <AppointmentBookingForm onSuccess={() => setBookingOpen(false)} />
          </DialogContent>
        </Dialog>
      </Box>
    );
  }

  // ==========================================
  // STAFF VIEW: FULL CLINICAL QUEUE & DATAGRID
  // ==========================================
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Appointments & Consultation Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage scheduling requests, approvals, and live consultation entries.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} size="large" onClick={() => setBookingOpen(true)}>
          New Appointment
        </Button>
      </Box>

      {/* Filter Tabs & Search Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
            <Tab label="All" value="All" />
            <Tab label="Approved" value="Approved" />
            <Tab label="Completed" value="Completed" />
            <Tab label="Cancelled/Rejected" value="Cancelled" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search patient, doctor, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Box>
      </Paper>

      {/* Appointments DataGrid */}
      <Paper sx={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={filteredStaffAppointments}
          columns={columns}
          pageSizeOptions={[10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Booking Form Modal */}
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Medical Appointment</DialogTitle>
        <DialogContent dividers>
          <AppointmentBookingForm onSuccess={() => setBookingOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
