'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  MenuItem,
  Alert,
} from '@mui/material';
import { ScienceIcon as Science, CheckCircleIcon as CheckCircle } from '@/components/common/Icons';


import { useAppDispatch } from '@/store/hooks';
import { updateLabResults } from '@/store/slices/labRequestsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { LabRequest, LabTestItem } from '@/types';

interface LabResultFormProps {
  labRequest: LabRequest;
  onSuccess?: () => void;
}

export const LabResultForm: React.FC<LabResultFormProps> = ({ labRequest, onSuccess }) => {
  const dispatch = useAppDispatch();

  // Local state for tests result values
  const [tests, setTests] = useState<LabTestItem[]>(
    labRequest.tests.map((t) => ({
      ...t,
      resultValue: t.resultValue || (t.code === 'CBC-01' ? '14.2' : t.code === 'LIP-02' ? '185' : '95'),
      unit: t.unit || (t.code === 'CBC-01' ? 'g/dL' : 'mg/dL'),
      referenceRange: t.referenceRange || (t.code === 'CBC-01' ? '12.0 - 15.5' : '< 200'),
      flag: t.flag || 'Normal',
      status: 'Completed',
    }))
  );

  const [labTechNotes, setLabTechNotes] = useState(
    'Fasting sample collected at 08:00 AM. Automated analyzer calibration verified.'
  );

  const handleValueChange = (id: string, field: keyof LabTestItem, value: any) => {
    setTests(tests.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(
      updateLabResults({
        labRequestId: labRequest.id,
        labTechNotes,
        tests,
      })
    );

    // Notify patient
    dispatch(
      addNotification({
        userId: labRequest.patientId,
        roleTarget: 'patient',
        title: 'Lab Results Completed',
        message: `Your lab results for ${labRequest.tests.map((t) => t.name).join(', ')} are ready.`,
        type: 'success',
        link: '/labs',
      })
    );

    if (onSuccess) onSuccess();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Alert icon={<Science fontSize="inherit" />} severity="info" sx={{ mb: 3 }}>
        Entering Lab Results for Patient <strong>{labRequest.patientName}</strong> (Order #{labRequest.id})
      </Alert>

      {tests.map((test) => (
        <Paper key={test.id} sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
            {test.name} ({test.code})
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Result Value"
                value={test.resultValue || ''}
                onChange={(e) => handleValueChange(test.id, 'resultValue', e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                label="Unit"
                value={test.unit || ''}
                onChange={(e) => handleValueChange(test.id, 'unit', e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="Reference Range"
                value={test.referenceRange || ''}
                onChange={(e) => handleValueChange(test.id, 'referenceRange', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Flag"
                value={test.flag || 'Normal'}
                onChange={(e) => handleValueChange(test.id, 'flag', e.target.value)}
              >
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Lab Technician Notes"
          value={labTechNotes}
          onChange={(e) => setLabTechNotes(e.target.value)}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" color="success" size="large" type="submit" startIcon={<CheckCircle />}>
          Save & Publish Lab Results
        </Button>
      </Box>
    </Box>
  );
};
