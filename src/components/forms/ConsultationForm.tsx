'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Paper,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  AddIcon,
  DeleteIcon,
  HospitalIcon as LocalHospital,
  ScienceIcon as Science,
  BillingIcon as Receipt,
} from '@/components/common/Icons';


import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addConsultation } from '@/store/slices/consultationsSlice';
import { addPrescription } from '@/store/slices/prescriptionsSlice';
import { addLabRequest } from '@/store/slices/labRequestsSlice';
import { addInvoice } from '@/store/slices/billingSlice';
import { updateAppointmentStatus } from '@/store/slices/appointmentsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { Appointment, InvoiceItem } from '@/types';


interface ConsultationFormProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

const AVAILABLE_LAB_TESTS = [
  { code: 'CBC-01', name: 'Complete Blood Count (CBC)', category: 'Hematology', cost: 60 },
  { code: 'LIP-02', name: 'Comprehensive Lipid Profile', category: 'Biochemistry', cost: 75 },
  { code: 'GLU-03', name: 'Fasting Blood Glucose (FBG)', category: 'Endocrinology', cost: 40 },
  { code: 'THY-04', name: 'TSH & Thyroid Function Panel', category: 'Endocrinology', cost: 90 },
  { code: 'KID-05', name: 'Renal Function & Electrolytes Test', category: 'Nephrology', cost: 85 },
];

const validationSchema = Yup.object({
  chiefComplaint: Yup.string().required('Chief complaint is required'),
  bpSystolic: Yup.number().min(60).max(250).required('BP Systolic is required'),
  bpDiastolic: Yup.number().min(40).max(150).required('BP Diastolic is required'),
  heartRate: Yup.number().min(30).max(220).required('Heart rate is required'),
  temperature: Yup.number().min(34).max(42).required('Temperature is required'),
  weightKg: Yup.number().min(1).max(300).required('Weight is required'),
  spo2: Yup.number().min(50).max(100).required('SpO2 is required'),
  diagnosis: Yup.string().required('Diagnosis is required'),
  clinicalNotes: Yup.string().min(10, 'Please write detailed clinical notes').required('Clinical notes are required'),
});

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ appointment, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);

  // Local state for dynamic medications and lab test selections
  const [medications, setMedications] = useState<
    Array<{ id: string; name: string; dosage: string; frequency: string; duration: string; instructions: string }>
  >([
    {
      id: 'med-1',
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Three times daily',
      duration: '7 Days',
      instructions: 'Take with food and full glass of water',
    },
  ]);

  const [selectedLabCodes, setSelectedLabCodes] = useState<string[]>(['CBC-01']);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        id: `med-${Date.now()}`,
        name: '',
        dosage: '10mg',
        frequency: 'Once Daily',
        duration: '30 Days',
        instructions: 'Take in the morning',
      },
    ]);
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleMedChange = (id: string, field: string, value: string) => {
    setMedications(medications.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleToggleLab = (code: string) => {
    if (selectedLabCodes.includes(code)) {
      setSelectedLabCodes(selectedLabCodes.filter((c) => c !== code));
    } else {
      setSelectedLabCodes([...selectedLabCodes, code]);
    }
  };

  const formik = useFormik({
    initialValues: {
      chiefComplaint: appointment.reason || 'Chest tightness & fatigue',
      bpSystolic: 124,
      bpDiastolic: 80,
      heartRate: 72,
      temperature: 36.6,
      weightKg: 68.0,
      heightCm: 172,
      spo2: 98,
      diagnosis: 'Acute Bronchitis (ICD-10 J20.9)',
      icdCode: 'J20.9',
      clinicalNotes:
        'Patient examined. Chest clear upon auscultation, mild pharyngeal redness. Prescribed antibiotics and recommended resting.',
    },
    validationSchema,
    onSubmit: (values) => {
      const dateStr = new Date().toISOString().split('T')[0];
      const prescriptionId = `rx-${Date.now().toString().slice(-4)}`;
      const labRequestId = `lab-${Date.now().toString().slice(-4)}`;

      // 1. Create Consultation
      dispatch(
        addConsultation({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          doctorId: currentUser.id,
          doctorName: currentUser.name,
          date: dateStr,
          chiefComplaint: values.chiefComplaint,
          symptoms: [values.chiefComplaint],
          vitals: {
            bpSystolic: Number(values.bpSystolic),
            bpDiastolic: Number(values.bpDiastolic),
            heartRate: Number(values.heartRate),
            temperature: Number(values.temperature),
            weightKg: Number(values.weightKg),
            heightCm: Number(values.heightCm),
            spo2: Number(values.spo2),
          },
          diagnosis: values.diagnosis,
          icdCode: values.icdCode,
          clinicalNotes: values.clinicalNotes,
          prescriptionIds: medications.length > 0 ? [prescriptionId] : [],
          labRequestIds: selectedLabCodes.length > 0 ? [labRequestId] : [],
          status: 'Completed',
        })
      );

      // 2. Create Prescription if medications added
      if (medications.length > 0) {
        dispatch(
          addPrescription({
            consultationId: `con-${Date.now().toString().slice(-4)}`,
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            doctorId: currentUser.id,
            doctorName: currentUser.name,
            date: dateStr,
            medications: medications.filter((m) => m.name.trim() !== ''),
            status: 'Issued',
          })
        );
      }

      // 3. Create Lab Request if tests selected
      if (selectedLabCodes.length > 0) {
        const testsToOrder = AVAILABLE_LAB_TESTS.filter((t) => selectedLabCodes.includes(t.code)).map(
          (t) => ({
            id: `t-${Date.now()}-${t.code}`,
            code: t.code,
            name: t.name,
            category: t.category,
            status: 'Pending' as const,
          })
        );

        dispatch(
          addLabRequest({
            consultationId: `con-${Date.now().toString().slice(-4)}`,
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            doctorId: currentUser.id,
            doctorName: currentUser.name,
            tests: testsToOrder,
            requestedDate: dateStr,
            status: 'Pending',
          })
        );
      }

      // 4. Generate Auto-Invoice
      const invoiceItems: InvoiceItem[] = [
        {
          id: `bi-con-${Date.now()}`,
          description: `Specialist Consultation Fee (${currentUser.name})`,
          category: 'Consultation',
          cost: 150,
        },
      ];


      if (medications.length > 0) {
        invoiceItems.push({
          id: `bi-rx-${Date.now()}`,
          description: `Prescription Fill (${medications.length} items)`,
          category: 'Medication' as const,
          cost: 45,
        });
      }

      selectedLabCodes.forEach((code) => {
        const testObj = AVAILABLE_LAB_TESTS.find((t) => t.code === code);
        if (testObj) {
          invoiceItems.push({
            id: `bi-lab-${code}`,
            description: `Lab Test: ${testObj.name}`,
            category: 'Lab Test' as const,
            cost: testObj.cost,
          });
        }
      });

      const subtotal = invoiceItems.reduce((acc, i) => acc + i.cost, 0);
      const insuranceDiscount = Math.round(subtotal * 0.6); // 60% coverage demo
      const tax = Math.round((subtotal - insuranceDiscount) * 0.07);
      const totalAmount = subtotal - insuranceDiscount + tax;

      dispatch(
        addInvoice({
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          date: dateStr,
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          items: invoiceItems,
          subtotal,
          insuranceDiscount,
          tax,
          totalAmount,
          status: 'Unpaid',
        })
      );

      // 5. Update Appointment Status
      dispatch(
        updateAppointmentStatus({
          id: appointment.id,
          status: 'Completed',
          notes: `Completed by ${currentUser.name}. Diagnosis: ${values.diagnosis}`,
        })
      );

      // 6. Notify Patient
      dispatch(
        addNotification({
          userId: appointment.patientId,
          roleTarget: 'patient',
          title: 'Consultation Completed',
          message: `Your consultation with ${currentUser.name} has been completed. Prescriptions & lab requests are updated.`,
          type: 'success',
          link: `/patients/${appointment.patientId}`,
        })
      );

      if (onSuccess) onSuccess();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      <Alert icon={<LocalHospital fontSize="inherit" />} severity="info" sx={{ mb: 3 }}>
        Conducting Live Consultation for <strong>{appointment.patientName}</strong> with{' '}
        <strong>{currentUser.name}</strong>.
      </Alert>

      {/* 1. Vitals Recording */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
          1. Patient Vitals Measurement
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              type="number"
              id="bpSystolic"
              name="bpSystolic"
              label="BP Systolic"
              InputProps={{ endAdornment: <Typography variant="caption">mmHg</Typography> }}
              value={formik.values.bpSystolic}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              type="number"
              id="bpDiastolic"
              name="bpDiastolic"
              label="BP Diastolic"
              InputProps={{ endAdornment: <Typography variant="caption">mmHg</Typography> }}
              value={formik.values.bpDiastolic}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              type="number"
              id="heartRate"
              name="heartRate"
              label="Heart Rate"
              InputProps={{ endAdornment: <Typography variant="caption">bpm</Typography> }}
              value={formik.values.heartRate}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              type="number"
              id="temperature"
              name="temperature"
              label="Temp"
              InputProps={{ endAdornment: <Typography variant="caption">°C</Typography> }}
              value={formik.values.temperature}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              type="number"
              id="weightKg"
              name="weightKg"
              label="Weight"
              InputProps={{ endAdornment: <Typography variant="caption">kg</Typography> }}
              value={formik.values.weightKg}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              type="number"
              id="spo2"
              name="spo2"
              label="SpO2"
              InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }}
              value={formik.values.spo2}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Clinical Evaluation & Diagnosis */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
          2. Clinical Findings & Diagnosis
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="chiefComplaint"
              name="chiefComplaint"
              label="Chief Complaint"
              value={formik.values.chiefComplaint}
              onChange={formik.handleChange}
              error={formik.touched.chiefComplaint && Boolean(formik.errors.chiefComplaint)}
              helperText={formik.touched.chiefComplaint && formik.errors.chiefComplaint}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="diagnosis"
              name="diagnosis"
              label="Diagnosis & ICD-10 Code"
              value={formik.values.diagnosis}
              onChange={formik.handleChange}
              error={formik.touched.diagnosis && Boolean(formik.errors.diagnosis)}
              helperText={formik.touched.diagnosis && formik.errors.diagnosis}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              id="clinicalNotes"
              name="clinicalNotes"
              label="Detailed Clinical Examination Notes"
              value={formik.values.clinicalNotes}
              onChange={formik.handleChange}
              error={formik.touched.clinicalNotes && Boolean(formik.errors.clinicalNotes)}
              helperText={formik.touched.clinicalNotes && formik.errors.clinicalNotes}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Prescription Rx Builder */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            3. Electronic Prescription (Rx)
          </Typography>
          <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddMedication}>
            Add Medication
          </Button>
        </Box>

        {medications.map((med, index) => (
          <Paper key={med.id} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#FAF5FF' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Medication Name"
                  placeholder="e.g. Amoxicillin"
                  value={med.name}
                  onChange={(e) => handleMedChange(med.id, 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  label="Dosage"
                  placeholder="e.g. 500mg"
                  value={med.dosage}
                  onChange={(e) => handleMedChange(med.id, 'dosage', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Frequency"
                  placeholder="e.g. Twice Daily"
                  value={med.frequency}
                  onChange={(e) => handleMedChange(med.id, 'frequency', e.target.value)}
                />
              </Grid>
              <Grid item xs={10} sm={3}>
                <TextField
                  fullWidth
                  label="Duration"
                  placeholder="e.g. 7 Days"
                  value={med.duration}
                  onChange={(e) => handleMedChange(med.id, 'duration', e.target.value)}
                />
              </Grid>
              <Grid item xs={2} sm={1}>
                <IconButton color="error" onClick={() => handleRemoveMedication(med.id)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Paper>

      {/* 4. Laboratory Orders */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
          4. Diagnostic Laboratory Orders
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select lab tests to order for this patient. Orders will route directly to the Laboratory department.
        </Typography>

        <Grid container spacing={1}>
          {AVAILABLE_LAB_TESTS.map((test) => {
            const isChecked = selectedLabCodes.includes(test.code);
            return (
              <Grid item xs={12} sm={6} key={test.code}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: isChecked ? 'primary.main' : 'divider',
                    bgcolor: isChecked ? 'primary.50' : 'background.paper',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleToggleLab(test.code)}
                >
                  <FormControlLabel
                    control={<Checkbox checked={isChecked} onChange={() => handleToggleLab(test.code)} />}
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {test.name} (${test.cost})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Category: {test.category} | Code: {test.code}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Submit Consultation */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" color="success" size="large" type="submit" startIcon={<Receipt />}>
          Finalize Consultation & Generate Invoice
        </Button>
      </Box>
    </Box>
  );
};
