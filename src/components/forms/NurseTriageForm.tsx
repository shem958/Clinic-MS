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
  Paper,
  Alert,
} from '@mui/material';
import { MedicalIcon, CheckIcon } from '@/components/common/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTriageRecord } from '@/store/slices/triageSlice';
import { updateAppointmentStatus } from '@/store/slices/appointmentsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { Appointment, TriagePriority } from '@/types';

interface NurseTriageFormProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  bpSystolic: Yup.number().min(50, 'Systolic BP too low').max(260, 'Systolic BP too high').required('BP Systolic required'),
  bpDiastolic: Yup.number().min(30, 'Diastolic BP too low').max(160, 'Diastolic BP too high').required('BP Diastolic required'),
  temperature: Yup.number().min(34, 'Temperature too low').max(43, 'Temperature too high').required('Temperature required'),
  heightCm: Yup.number().min(30, 'Height invalid').max(250, 'Height invalid').required('Height required'),
  weightKg: Yup.number().min(1, 'Weight invalid').max(350, 'Weight invalid').required('Weight required'),
  spo2: Yup.number().min(50, 'Oxygen saturation too low').max(100, 'Invalid SpO2').required('SpO2 required'),
  pulseRate: Yup.number().min(30, 'Pulse rate invalid').max(220, 'Pulse rate invalid').required('Pulse rate required'),
  priority: Yup.string().oneOf(['Emergency', 'Urgent', 'Routine']).required('Triage Priority required'),
  chiefComplaintSummary: Yup.string().required('Chief complaint summary required'),
});

export const NurseTriageForm: React.FC<NurseTriageFormProps> = ({ appointment, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      bpSystolic: appointment.triageRecord?.bpSystolic || 120,
      bpDiastolic: appointment.triageRecord?.bpDiastolic || 80,
      temperature: appointment.triageRecord?.temperature || 36.6,
      heightCm: appointment.triageRecord?.heightCm || 170,
      weightKg: appointment.triageRecord?.weightKg || 65,
      spo2: appointment.triageRecord?.spo2 || 98,
      pulseRate: appointment.triageRecord?.pulseRate || 72,
      priority: (appointment.triageRecord?.priority || (appointment.type === 'Walk-In Emergency' ? 'Emergency' : 'Routine')) as TriagePriority,
      chiefComplaintSummary: appointment.reason || 'Patient presenting for routine consultation.',
      nurseNotes: appointment.triageRecord?.nurseNotes || 'Patient alert, conscious, and cooperative.',
    },
    validationSchema,
    onSubmit: (values) => {
      // 1. Create Triage Record
      dispatch(
        addTriageRecord({
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          nurseId: currentUser.id,
          nurseName: currentUser.name,
          bpSystolic: Number(values.bpSystolic),
          bpDiastolic: Number(values.bpDiastolic),
          temperature: Number(values.temperature),
          heightCm: Number(values.heightCm),
          weightKg: Number(values.weightKg),
          spo2: Number(values.spo2),
          pulseRate: Number(values.pulseRate),
          priority: values.priority as TriagePriority,
          chiefComplaintSummary: values.chiefComplaintSummary,
          nurseNotes: values.nurseNotes,
        })
      );

      // 2. Advance Appointment Status to Triaged-Pending-Doctor
      dispatch(
        updateAppointmentStatus({
          id: appointment.id,
          status: 'Triaged-Pending-Doctor',
          notes: `Nurse ${currentUser.name} completed pre-doctor triage. Priority: ${values.priority}. BP: ${values.bpSystolic}/${values.bpDiastolic}, Temp: ${values.temperature}°C.`,
        })
      );

      // 3. Notify Doctor Queue
      dispatch(
        addNotification({
          userId: appointment.doctorId,
          roleTarget: 'doctor',
          title: values.priority === 'Emergency' ? '🚨 EMERGENCY PATIENT TRIAGED' : 'Nurse Triage Vitals Complete',
          message: `Nurse ${currentUser.name} completed triage for ${appointment.patientName}. BP: ${values.bpSystolic}/${values.bpDiastolic}, Temp: ${values.temperature}°C. Priority: ${values.priority}.`,
          type: values.priority === 'Emergency' ? 'error' : values.priority === 'Urgent' ? 'warning' : 'info',
          link: `/consultation/${appointment.id}`,
        })
      );

      if (onSuccess) onSuccess();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      <Alert icon={<MedicalIcon fontSize="inherit" />} severity={formik.values.priority === 'Emergency' ? 'error' : 'info'} sx={{ mb: 3 }}>
        <strong>Kenyan Pre-Doctor Nurse Triage Station</strong> | Patient: <strong>{appointment.patientName}</strong> | Nurse: <strong>{currentUser.name}</strong>
      </Alert>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
          1. Vital Signs Measurement
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="number"
              id="bpSystolic"
              name="bpSystolic"
              label="BP Systolic"
              InputProps={{ endAdornment: <Typography variant="caption">mmHg</Typography> }}
              value={formik.values.bpSystolic}
              onChange={formik.handleChange}
              error={formik.touched.bpSystolic && Boolean(formik.errors.bpSystolic)}
              helperText={formik.touched.bpSystolic && formik.errors.bpSystolic}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="number"
              id="bpDiastolic"
              name="bpDiastolic"
              label="BP Diastolic"
              InputProps={{ endAdornment: <Typography variant="caption">mmHg</Typography> }}
              value={formik.values.bpDiastolic}
              onChange={formik.handleChange}
              error={formik.touched.bpDiastolic && Boolean(formik.errors.bpDiastolic)}
              helperText={formik.touched.bpDiastolic && formik.errors.bpDiastolic}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="number"
              id="temperature"
              name="temperature"
              label="Body Temp"
              InputProps={{ endAdornment: <Typography variant="caption">°C</Typography> }}
              value={formik.values.temperature}
              onChange={formik.handleChange}
              error={formik.touched.temperature && Boolean(formik.errors.temperature)}
              helperText={formik.touched.temperature && formik.errors.temperature}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="number"
              id="pulseRate"
              name="pulseRate"
              label="Pulse / Heart Rate"
              InputProps={{ endAdornment: <Typography variant="caption">bpm</Typography> }}
              value={formik.values.pulseRate}
              onChange={formik.handleChange}
              error={formik.touched.pulseRate && Boolean(formik.errors.pulseRate)}
              helperText={formik.touched.pulseRate && formik.errors.pulseRate}
            />
          </Grid>

          <Grid item xs={6} sm={4}>
            <TextField
              fullWidth
              type="number"
              id="heightCm"
              name="heightCm"
              label="Height"
              InputProps={{ endAdornment: <Typography variant="caption">cm</Typography> }}
              value={formik.values.heightCm}
              onChange={formik.handleChange}
              error={formik.touched.heightCm && Boolean(formik.errors.heightCm)}
              helperText={formik.touched.heightCm && formik.errors.heightCm}
            />
          </Grid>

          <Grid item xs={6} sm={4}>
            <TextField
              fullWidth
              type="number"
              id="weightKg"
              name="weightKg"
              label="Weight"
              InputProps={{ endAdornment: <Typography variant="caption">kg</Typography> }}
              value={formik.values.weightKg}
              onChange={formik.handleChange}
              error={formik.touched.weightKg && Boolean(formik.errors.weightKg)}
              helperText={formik.touched.weightKg && formik.errors.weightKg}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              id="spo2"
              name="spo2"
              label="Oxygen Saturation (SpO2)"
              InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }}
              value={formik.values.spo2}
              onChange={formik.handleChange}
              error={formik.touched.spo2 && Boolean(formik.errors.spo2)}
              helperText={formik.touched.spo2 && formik.errors.spo2}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
          2. Clinical Triage Assessment & Priority Tagging
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              id="priority"
              name="priority"
              label="Triage Priority Level"
              value={formik.values.priority}
              onChange={formik.handleChange}
            >
              <MenuItem value="Routine">🟢 Routine (Green Flag)</MenuItem>
              <MenuItem value="Urgent">🟡 Urgent (Yellow Flag)</MenuItem>
              <MenuItem value="Emergency">🔴 Emergency (Red Flag - Fast Track)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              id="chiefComplaintSummary"
              name="chiefComplaintSummary"
              label="Nurse Summary of Chief Complaint"
              value={formik.values.chiefComplaintSummary}
              onChange={formik.handleChange}
              error={formik.touched.chiefComplaintSummary && Boolean(formik.errors.chiefComplaintSummary)}
              helperText={formik.touched.chiefComplaintSummary && formik.errors.chiefComplaintSummary}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              id="nurseNotes"
              name="nurseNotes"
              label="Nurse Clinical Observations & Pre-Doctor Instructions"
              placeholder="e.g. Patient placed on bed 2. Warm fluids given."
              value={formik.values.nurseNotes}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" color="success" size="large" type="submit" startIcon={<CheckIcon />}>
          Save Vitals & Transfer Patient to Doctor Queue
        </Button>
      </Box>
    </Box>
  );
};
