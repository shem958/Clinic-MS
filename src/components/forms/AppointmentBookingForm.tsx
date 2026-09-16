'use client';

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addAppointment } from '@/store/slices/appointmentsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';

interface AppointmentBookingFormProps {
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  doctorId: Yup.string().required('Doctor selection is required'),
  date: Yup.string().required('Appointment date is required'),
  timeSlot: Yup.string().required('Time slot is required'),
  type: Yup.string().oneOf(['In-Person', 'Telehealth', 'Follow-up']).required('Appointment type is required'),
  reason: Yup.string().min(10, 'Please provide at least 10 characters describing your symptoms or reason').required('Reason for visit is required'),
});

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '02:00 PM',
  '02:30 PM',
  '03:30 PM',
  '04:00 PM',
];

export const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { availableUsers } = useAppSelector((state) => state.auth);
  const doctors = availableUsers.filter((u) => u.role === 'doctor');

  const formik = useFormik({
    initialValues: {
      doctorId: doctors[0]?.id || 'doc-1',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow default
      timeSlot: '10:00 AM',
      type: 'In-Person',
      reason: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const doctor = doctors.find((d) => d.id === values.doctorId);

      dispatch(
        addAppointment({
          patientId: currentUser.id,
          patientName: currentUser.name,
          doctorId: values.doctorId,
          doctorName: doctor?.name || 'Dr. Alex Mercer',
          specialty: doctor?.specialty || 'General Medicine',
          date: values.date,
          timeSlot: values.timeSlot,
          type: values.type as 'In-Person' | 'Telehealth' | 'Follow-up',
          reason: values.reason,
        })
      );

      // Trigger notification to doctor
      dispatch(
        addNotification({
          userId: values.doctorId,
          roleTarget: 'doctor',
          title: 'New Appointment Request',
          message: `${currentUser.name} requested an appointment for ${values.date} at ${values.timeSlot}.`,
          type: 'info',
          link: '/appointments',
        })
      );

      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Request a Medical Appointment
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            id="doctorId"
            name="doctorId"
            label="Select Doctor / Specialist"
            value={formik.values.doctorId}
            onChange={formik.handleChange}
            error={formik.touched.doctorId && Boolean(formik.errors.doctorId)}
            helperText={formik.touched.doctorId && formik.errors.doctorId}
          >
            {doctors.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialty}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            id="type"
            name="type"
            label="Consultation Type"
            value={formik.values.type}
            onChange={formik.handleChange}
            error={formik.touched.type && Boolean(formik.errors.type)}
            helperText={formik.touched.type && formik.errors.type}
          >
            <MenuItem value="In-Person">In-Person Consultation</MenuItem>
            <MenuItem value="Telehealth">Telehealth / Video Call</MenuItem>
            <MenuItem value="Follow-up">Follow-up Visit</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            id="date"
            name="date"
            label="Preferred Date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.date}
            onChange={formik.handleChange}
            error={formik.touched.date && Boolean(formik.errors.date)}
            helperText={formik.touched.date && formik.errors.date}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            id="timeSlot"
            name="timeSlot"
            label="Preferred Time Slot"
            value={formik.values.timeSlot}
            onChange={formik.handleChange}
            error={formik.touched.timeSlot && Boolean(formik.errors.timeSlot)}
            helperText={formik.touched.timeSlot && formik.errors.timeSlot}
          >
            {TIME_SLOTS.map((slot) => (
              <MenuItem key={slot} value={slot}>
                {slot}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            id="reason"
            name="reason"
            label="Reason for Visit / Symptoms"
            placeholder="Please describe your symptoms, duration, or reason for requesting this appointment..."
            value={formik.values.reason}
            onChange={formik.handleChange}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" size="large" type="submit">
          Submit Appointment Request
        </Button>
      </Box>
    </Box>
  );
};
