'use client';

import React, { useState } from 'react';
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
  Divider,
  Chip,
} from '@mui/material';
import { EmergencyIcon, CheckIcon } from '@/components/common/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addPatient } from '@/store/slices/patientsSlice';
import { addAppointment } from '@/store/slices/appointmentsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { addTriageRecord } from '@/store/slices/triageSlice';
import { SmsEmailLog } from '@/types';

interface EmergencyFastTrackFormProps {
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Emergency identification/name is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender is required'),
  age: Yup.number().positive().required('Approximate age is required'),
  chiefComplaint: Yup.string().required('Emergency reason / chief complaint is required'),
  doctorId: Yup.string().required('Assigned ER Doctor required'),
});

export const EmergencyFastTrackForm: React.FC<EmergencyFastTrackFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { availableUsers } = useAppSelector((state) => state.auth);
  const doctors = availableUsers.filter((u) => u.role === 'doctor');

  const [dispatchedLog, setDispatchedLog] = useState<SmsEmailLog | null>(null);

  const formik = useFormik({
    initialValues: {
      name: 'Trauma Patient (Unidentified / Emergency)',
      age: 35,
      gender: 'Male',
      chiefComplaint: 'Acute Respiratory Distress & Severe Chest Pain',
      contactPhone: '+254 700 000 911',
      contactEmail: 'er-responder@smartclinic.co.ke',
      doctorId: doctors[0]?.id || 'doc-1',
      immediateBP: '140/90',
      immediateTemp: 38.5,
      immediateSpO2: 92,
      bypassedPaperworkNotes: 'Patient admitted directly via Red Zone Ambulance entrance. Vitals recorded at bedside.',
    },
    validationSchema,
    onSubmit: (values) => {
      const generatedMrn = `MRN-EMERGENCY-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedPin = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
      const patientId = `pat-emg-${Date.now().toString().slice(-4)}`;

      // 1. Instantly register Patient record in system
      dispatch(
        addPatient({
          name: values.name,
          age: Number(values.age),
          gender: values.gender as 'Male' | 'Female' | 'Other',
          dob: '1990-01-01',
          phone: values.contactPhone,
          email: values.contactEmail,
          address: 'Emergency Admissions - Resuscitation Bay 1',
          bloodGroup: 'O- (Universal Donor)',
          allergies: ['Unknown (Emergency Bay Assessment)'],
          medicalHistory: ['Acute Emergency Intake'],
          insurance: {
            provider: 'Emergency Trauma Fund / SHA Kenya',
            policyNumber: 'EMG-FAST-TRACK',
            copay: 0,
          },
          emergencyContact: {
            name: 'ER Attending Nurse',
            phone: values.contactPhone,
            relationship: 'First Responder',
          },
          status: 'Emergency-Unverified',
          isEmergency: true,
          tempPassword: generatedPin,
          notificationSent: {
            sms: true,
            email: true,
            sentAt: new Date().toISOString(),
          },
        })
      );

      // 2. Auto-create Nurse Triage Record marked Emergency
      dispatch(
        addTriageRecord({
          patientId,
          patientName: values.name,
          nurseId: 'nurse-1',
          nurseName: 'Nurse Riley Davis',
          bpSystolic: 140,
          bpDiastolic: 90,
          temperature: Number(values.immediateTemp),
          heightCm: 175,
          weightKg: 70,
          spo2: Number(values.immediateSpO2),
          pulseRate: 110,
          priority: 'Emergency',
          chiefComplaintSummary: values.chiefComplaint,
          nurseNotes: values.bypassedPaperworkNotes,
        })
      );

      // 3. Auto-create Emergency Appointment for assigned doctor
      const doctor = doctors.find((d) => d.id === values.doctorId);
      dispatch(
        addAppointment({
          patientId,
          patientName: values.name,
          doctorId: values.doctorId,
          doctorName: doctor?.name || 'Dr. Emergency On-Call',
          specialty: doctor?.specialty || 'Emergency Medicine',
          date: new Date().toISOString().split('T')[0],
          timeSlot: 'IMMEDIATE (Red Priority)',
          type: 'Walk-In Emergency',
          status: 'Triaged-Pending-Doctor',
          reason: values.chiefComplaint,
          notes: `FAST-TRACK EMERGENCY: Paperwork deferred. Temporary MRN: ${generatedMrn}`,
        })
      );

      // 4. Alert ER Staff & Dispatch SMS Log
      dispatch(
        addNotification({
          userId: values.doctorId,
          roleTarget: 'doctor',
          title: '🚨 CRITICAL EMERGENCY ADMISSION',
          message: `Red Zone Alert: ${values.name} transferred to Resuscitation Bay. Priority: EMERGENCY.`,
          type: 'error',
          link: '/consultation',
        })
      );

      const log: SmsEmailLog = {
        id: `log-${Date.now()}`,
        patientName: values.name,
        phone: values.contactPhone,
        email: values.contactEmail,
        mrn: generatedMrn,
        tempPin: generatedPin,
        smsStatus: 'Delivered',
        emailStatus: 'Delivered',
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setDispatchedLog(log);

      if (onSuccess) {
        setTimeout(onSuccess, 3000);
      }
    },
  });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '2px solid #ef5350', bgcolor: '#fff5f5' }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Box
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmergencyIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="error.dark">
            Red-Zone Emergency Fast-Track Registration
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bypasses regular intake queue. Creates instant temporary MRN and routes directly to Trauma Doctor.
          </Typography>
        </Box>
      </Box>

      {dispatchedLog ? (
        <Box>
          <Alert severity="error" icon={<CheckIcon />} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              EMERGENCY BYPASS ACTIVATED - PATIENT TRANSFERRED TO RESUSCITATION BAY!
            </Typography>
            <Typography variant="body2">
              Generated Emergency MRN: <strong>{dispatchedLog.mrn}</strong> | Temp PIN: <strong>{dispatchedLog.tempPin}</strong>
            </Typography>
          </Alert>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#ffffff', mb: 2, borderColor: '#ef5350' }}>
            <Typography variant="subtitle2" fontWeight={700} color="error.main" mb={1}>
              Automated First-Responder Broadcast Log:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={`SMS to ER Responder: ${dispatchedLog.phone}`} color="error" size="small" />
              <Chip label={`Email Alert Sent: ${dispatchedLog.email}`} color="error" variant="outlined" size="small" />
              <Chip label={`Doctor Dispatch: NOTIFIED`} color="warning" size="small" />
            </Box>
          </Paper>

          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => {
              setDispatchedLog(null);
              formik.resetForm();
            }}
          >
            Register Another Emergency Intake
          </Button>
        </Box>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                id="name"
                name="name"
                label="Emergency Identification / Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                size="small"
                id="age"
                name="age"
                label="Approx. Age"
                type="number"
                value={formik.values.age}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                size="small"
                select
                id="gender"
                name="gender"
                label="Gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                id="chiefComplaint"
                name="chiefComplaint"
                label="Chief Complaint / Emergency Condition"
                placeholder="e.g. Acute Traumatic Injury, Anaphylaxis, Cardiac Arrest"
                value={formik.values.chiefComplaint}
                onChange={formik.handleChange}
                error={formik.touched.chiefComplaint && Boolean(formik.errors.chiefComplaint)}
                helperText={formik.touched.chiefComplaint && formik.errors.chiefComplaint}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                select
                id="doctorId"
                name="doctorId"
                label="Assign ER Lead Doctor"
                value={formik.values.doctorId}
                onChange={formik.handleChange}
              >
                {doctors.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialty || 'General ER'})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                id="contactPhone"
                name="contactPhone"
                label="First Responder Phone / SMS Alert"
                value={formik.values.contactPhone}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                id="immediateBP"
                name="immediateBP"
                label="Bedside BP (mmHg)"
                value={formik.values.immediateBP}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                id="immediateTemp"
                name="immediateTemp"
                label="Temp (°C)"
                type="number"
                value={formik.values.immediateTemp}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                id="immediateSpO2"
                name="immediateSpO2"
                label="SpO2 (%)"
                type="number"
                value={formik.values.immediateSpO2}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                id="bypassedPaperworkNotes"
                name="bypassedPaperworkNotes"
                label="Emergency Notes & Triage Bypass Rationale"
                value={formik.values.bypassedPaperworkNotes}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<EmergencyIcon />}
                  sx={{ px: 4, py: 1.2, fontWeight: 700 }}
                >
                  IMMEDIATE FAST-TRACK ADMISSION
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}
    </Paper>
  );
};
