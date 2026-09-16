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
import { CheckIcon, PersonIcon } from '@/components/common/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addPatient } from '@/store/slices/patientsSlice';
import { addAppointment } from '@/store/slices/appointmentsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { SmsEmailLog } from '@/types';

interface ReceptionistWalkInFormProps {
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().min(3, 'Name must be at least 3 characters').required('Patient full name is required'),
  phone: Yup.string().required('Phone number is required for SMS notification'),
  email: Yup.string().email('Invalid email address').required('Email address is required'),
  age: Yup.number().positive().required('Age is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender is required'),
  doctorId: Yup.string().required('Assigned doctor required'),
  insuranceProvider: Yup.string().required('Insurance / Payment method required'),
});

export const ReceptionistWalkInForm: React.FC<ReceptionistWalkInFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { availableUsers } = useAppSelector((state) => state.auth);
  const doctors = availableUsers.filter((u) => u.role === 'doctor');

  const [dispatchedLog, setDispatchedLog] = useState<SmsEmailLog | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      age: 30,
      gender: 'Female',
      dob: '1996-01-01',
      phone: '+254 7',
      email: '',
      address: 'Nairobi, Kenya',
      bloodGroup: 'O+',
      doctorId: doctors[0]?.id || 'doc-1',
      insuranceProvider: 'NHIF / SHA Kenya',
      policyNumber: 'NHIF-884102',
      emergencyContactName: '',
      emergencyContactPhone: '',
      reasonForVisit: 'Walk-In Consultation & General Checkup',
    },
    validationSchema,
    onSubmit: (values) => {
      const generatedMrn = `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedPin = `PIN-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedActivationCode = `ACT-${Math.floor(1000 + Math.random() * 9000)}`;
      const patientId = `pat-${Date.now().toString().slice(-4)}`;

      // 1. Create Patient Record with Special Activation Code
      dispatch(
        addPatient({
          name: values.name,
          age: Number(values.age),
          gender: values.gender as 'Male' | 'Female' | 'Other',
          dob: values.dob,
          phone: values.phone,
          email: values.email,
          address: values.address,
          bloodGroup: values.bloodGroup,
          allergies: [],
          medicalHistory: [],
          insurance: {
            provider: values.insuranceProvider,
            policyNumber: values.policyNumber,
            copay: 500,
          },
          emergencyContact: {
            name: values.emergencyContactName || 'Self',
            phone: values.emergencyContactPhone || values.phone,
            relationship: 'Contact Person',
          },
          status: 'Active',
          tempPassword: generatedPin,
          activationCode: generatedActivationCode,
          isAccountClaimed: false,
        })
      );

      // 2. Create Appointment in Nurse Triage Queue
      const doctor = doctors.find((d) => d.id === values.doctorId);
      dispatch(
        addAppointment({
          patientId,
          patientName: values.name,
          doctorId: values.doctorId,
          doctorName: doctor?.name || 'Dr. Alex Mercer',
          specialty: doctor?.specialty || 'General Medicine',
          date: new Date().toISOString().split('T')[0],
          timeSlot: 'Walk-In (Now)',
          type: 'In-Person',
          reason: values.reasonForVisit,
        })
      );

      // 3. Simulate SMS & Email Credential Dispatch
      const logRecord: SmsEmailLog = {
        id: `log-${Date.now()}`,
        patientName: values.name,
        phone: values.phone,
        email: values.email,
        mrn: generatedMrn,
        tempPin: `${generatedActivationCode} (${generatedPin})`,
        smsStatus: 'Delivered',
        emailStatus: 'Delivered',
        sentAt: new Date().toISOString(),
      };
      setDispatchedLog(logRecord);

      // 4. Notify Nurse Triage Station
      dispatch(
        addNotification({
          userId: 'nurse-1',
          roleTarget: 'nurse',
          title: 'Walk-In Patient Registered at Reception',
          message: `${values.name} (${generatedMrn}) checked in with Special Code ${generatedActivationCode}. Please conduct Nurse Triage vitals (BP, Temp, Height, Weight).`,
          type: 'info',
          link: '/nurse/triage',
        })
      );
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      {dispatchedLog ? (
        <Paper sx={{ p: 3, bgcolor: '#F0FDF4', border: '2px solid #22C55E', borderRadius: 4 }}>
          <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
            Walk-in Patient Account Created & Special Activation Code Dispatched!
          </Alert>

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Automated SMS & Email Credential Dispatch Details:
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #E2E8F0', mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                📲 SMS Broadcast To: {dispatchedLog.phone} [Status: Delivered via SmsSasa Gateway]
              </Typography>
              <Chip label="Special Code Sent" color="success" size="small" />
            </Box>
            <Paper variant="outlined" sx={{ p: 2, my: 1.5, bgcolor: '#F8FAFC', fontSize: '0.9rem', borderLeft: '4px solid #0F766E' }}>
              "Welcome to Smart Clinic Kenya! Your walk-in intake is complete.
              <br />
              <strong>🔑 Special Account Activation Code:</strong> <span style={{ color: '#0F766E', fontSize: '1.05rem', fontWeight: 800 }}>{dispatchedLog.tempPin.split(' ')[0]}</span>
              <br />
              <strong>Medical Record No (MRN):</strong> {dispatchedLog.mrn}
              <br />
              <strong>Account Setup Portal:</strong> <a href="/patient/activate" style={{ color: '#0F766E', fontWeight: 700 }}>http://localhost:3000/patient/activate</a>
              <br />
              Use this special code to choose your permanent password and set up your personal portal login."
            </Paper>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #E2E8F0', mb: 2 }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
              📧 Email Sent To: {dispatchedLog.email} [Status: Delivered]
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Subject: Your Smart Clinic Account & Mobile Access Credentials ({dispatchedLog.mrn})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                setDispatchedLog(null);
                formik.resetForm();
                if (onSuccess) onSuccess();
              }}
            >
              Done / Return to Reception Queue
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Receptionist Walk-In Onboarding</strong>: Creating a new patient record automatically sends SMS & Email login credentials to the patient's phone and queues them for <strong>Nurse Triage</strong>.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Patient Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="number"
                id="age"
                name="age"
                label="Age"
                value={formik.values.age}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number (for SMS Credentials)"
                placeholder="+254 712 345678"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address (for Email Credentials)"
                placeholder="patient@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                id="doctorId"
                name="doctorId"
                label="Assign Consulting Doctor"
                value={formik.values.doctorId}
                onChange={formik.handleChange}
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
                id="insuranceProvider"
                name="insuranceProvider"
                label="Insurance / Payment Method"
                value={formik.values.insuranceProvider}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="reasonForVisit"
                name="reasonForVisit"
                label="Reason for Visit / Symptoms"
                value={formik.values.reasonForVisit}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="large" type="submit" startIcon={<PersonIcon />}>
              Create Patient Account & Dispatch Credentials via SMS/Email
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};
