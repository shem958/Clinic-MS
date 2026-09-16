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
  Divider,
} from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { addPatient } from '@/store/slices/patientsSlice';

interface PatientRegistrationFormProps {
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().min(3, 'Name must be at least 3 characters').required('Full name is required'),
  age: Yup.number().positive('Age must be positive').integer().required('Age is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender is required'),
  dob: Yup.string().required('Date of birth is required'),
  phone: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email address').required('Email address is required'),
  address: Yup.string().required('Home address is required'),
  bloodGroup: Yup.string().required('Blood group is required'),
  insuranceProvider: Yup.string().required('Insurance provider is required'),
  policyNumber: Yup.string().required('Policy number is required'),
  emergencyContactName: Yup.string().required('Emergency contact name is required'),
  emergencyContactPhone: Yup.string().required('Emergency contact phone is required'),
});

export const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      name: '',
      age: 30,
      gender: 'Female',
      dob: '1996-01-01',
      phone: '',
      email: '',
      address: '',
      bloodGroup: 'O+',
      allergies: '',
      medicalHistory: '',
      insuranceProvider: 'BlueCross HealthCare',
      policyNumber: '',
      copay: 25,
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyRelationship: 'Spouse',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
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
          allergies: values.allergies ? values.allergies.split(',').map((s) => s.trim()) : [],
          medicalHistory: values.medicalHistory
            ? values.medicalHistory.split(',').map((s) => s.trim())
            : [],
          insurance: {
            provider: values.insuranceProvider,
            policyNumber: values.policyNumber,
            copay: Number(values.copay),
          },
          emergencyContact: {
            name: values.emergencyContactName,
            phone: values.emergencyContactPhone,
            relationship: values.emergencyRelationship,
          },
          status: 'Active',
        })
      );
      resetForm();
      if (onSuccess) onSuccess();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        New Patient EMR Registration
      </Typography>

      <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
        1. Personal Demographics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Full Name"
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
            error={formik.touched.age && Boolean(formik.errors.age)}
            helperText={formik.touched.age && formik.errors.age}
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

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="date"
            id="dob"
            name="dob"
            label="Date of Birth"
            InputLabelProps={{ shrink: true }}
            value={formik.values.dob}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone Number"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            id="address"
            name="address"
            label="Home Address"
            value={formik.values.address}
            onChange={formik.handleChange}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            id="bloodGroup"
            name="bloodGroup"
            label="Blood Type"
            value={formik.values.bloodGroup}
            onChange={formik.handleChange}
          >
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <MenuItem key={bg} value={bg}>
                {bg}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
        2. Clinical Background & Insurance
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="allergies"
            name="allergies"
            label="Known Allergies (comma separated)"
            placeholder="e.g. Penicillin, Peanuts, Latex"
            value={formik.values.allergies}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="medicalHistory"
            name="medicalHistory"
            label="Medical Conditions / History"
            placeholder="e.g. Asthma, Hypertension"
            value={formik.values.medicalHistory}
            onChange={formik.handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="insuranceProvider"
            name="insuranceProvider"
            label="Insurance Provider"
            value={formik.values.insuranceProvider}
            onChange={formik.handleChange}
            error={formik.touched.insuranceProvider && Boolean(formik.errors.insuranceProvider)}
            helperText={formik.touched.insuranceProvider && formik.errors.insuranceProvider}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="policyNumber"
            name="policyNumber"
            label="Policy / Group Number"
            value={formik.values.policyNumber}
            onChange={formik.handleChange}
            error={formik.touched.policyNumber && Boolean(formik.errors.policyNumber)}
            helperText={formik.touched.policyNumber && formik.errors.policyNumber}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
        3. Emergency Contact
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="emergencyContactName"
            name="emergencyContactName"
            label="Emergency Contact Name"
            value={formik.values.emergencyContactName}
            onChange={formik.handleChange}
            error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
            helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="emergencyContactPhone"
            name="emergencyContactPhone"
            label="Emergency Contact Phone"
            value={formik.values.emergencyContactPhone}
            onChange={formik.handleChange}
            error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
            helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="emergencyRelationship"
            name="emergencyRelationship"
            label="Relationship"
            value={formik.values.emergencyRelationship}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" type="submit">
          Save Patient EMR Record
        </Button>
      </Box>
    </Box>
  );
};
