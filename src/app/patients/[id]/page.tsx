'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  ArrowBackIcon,
  HospitalIcon,
  ScienceIcon,
  PrescriptionIcon,
  BillingIcon,
  ScienceIcon as VitalsIcon,
  AddIcon,
} from '@/components/common/Icons';

import { useAppSelector } from '@/store/hooks';
import { WorkflowStatusChip } from '@/components/common/WorkflowStatusChip';

export default function PatientEMRDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const { items: patients } = useAppSelector((state) => state.patients);
  const { items: consultations } = useAppSelector((state) => state.consultations);
  const { items: prescriptions } = useAppSelector((state) => state.prescriptions);
  const { items: labRequests } = useAppSelector((state) => state.labRequests);
  const { items: billing } = useAppSelector((state) => state.billing);

  const [tabValue, setTabValue] = useState(0);

  const patient = patients.find((p) => p.id === patientId) || patients[0];
  const patientConsultations = consultations.filter((c) => c.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter((r) => r.patientId === patient.id);
  const patientLabs = labRequests.filter((l) => l.patientId === patient.id);
  const patientBilling = billing.filter((b) => b.patientId === patient.id);

  if (!patient) {
    return (
      <Box p={4}>
        <Alert severity="error">Patient record not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/patients')}
        sx={{ mb: 2 }}
      >
        Back to Patients Directory
      </Button>

      {/* Header Profile Banner */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: '#FFFFFF' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 800,
                }}
              >
                {patient.name.charAt(0)}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {patient.name}
                  </Typography>
                  <Chip label={patient.mrn} color="primary" sx={{ fontWeight: 700 }} />
                  <Chip label={`Blood Type: ${patient.bloodGroup}`} color="error" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Age: <strong>{patient.age} yrs</strong> | Gender: <strong>{patient.gender}</strong> | DOB: <strong>{patient.dob}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact: <strong>{patient.phone}</strong> | Email: <strong>{patient.email}</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                INSURANCE INFORMATION
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {patient.insurance.provider}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Policy #{patient.insurance.policyNumber} | Copay: ${patient.insurance.copay}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* Emergency Contact & Allergies Bar */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              EMERGENCY CONTACT:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) — {patient.emergencyContact.phone}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block' }}>
              KNOWN ALLERGIES:
            </Typography>
            {patient.allergies.length === 0 ? (
              <Typography variant="body2">No known allergies.</Typography>
            ) : (
              patient.allergies.map((alg) => (
                <Chip key={alg} label={alg} color="error" size="small" variant="outlined" sx={{ mr: 0.5 }} />
              ))
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs View */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Vitals & Medical Summary" icon={<VitalsIcon />} iconPosition="start" />
          <Tab label={`Consultation History (${patientConsultations.length})`} icon={<HospitalIcon />} iconPosition="start" />
          <Tab label={`Prescriptions (${patientPrescriptions.length})`} icon={<PrescriptionIcon />} iconPosition="start" />
          <Tab label={`Lab Reports (${patientLabs.length})`} icon={<ScienceIcon />} iconPosition="start" />
          <Tab label={`Billing Ledger (${patientBilling.length})`} icon={<BillingIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 0: Vitals & History */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Vitals Measurements
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Latest Value</TableCell>
                    <TableCell>Reference Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Blood Pressure</TableCell>
                    <TableCell>128 / 82 mmHg</TableCell>
                    <TableCell><Chip label="Prehypertension" size="small" color="warning" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Heart Rate</TableCell>
                    <TableCell>74 bpm</TableCell>
                    <TableCell><Chip label="Normal" size="small" color="success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Body Temperature</TableCell>
                    <TableCell>36.8 °C</TableCell>
                    <TableCell><Chip label="Normal" size="small" color="success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Weight / Height</TableCell>
                    <TableCell>64.5 kg / 168 cm</TableCell>
                    <TableCell><Chip label="BMI: 22.9 (Healthy)" size="small" color="success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Oxygen Saturation (SpO2)</TableCell>
                    <TableCell>99 %</TableCell>
                    <TableCell><Chip label="Optimal" size="small" color="success" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                Chronic Medical Conditions
              </Typography>
              {patient.medicalHistory.map((historyItem) => (
                <Paper key={historyItem} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    • {historyItem}
                  </Typography>
                </Paper>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Consultations */}
      {tabValue === 1 && (
        <Box>
          {patientConsultations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No consultation records on file.</Typography>
            </Paper>
          ) : (
            patientConsultations.map((con) => (
              <Paper key={con.id} sx={{ p: 3, mb: 2, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Consultation #{con.id} — {con.date}
                  </Typography>
                  <Chip label={con.doctorName} color="primary" variant="outlined" />
                </Box>
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  Chief Complaint: {con.chiefComplaint}
                </Typography>
                <Typography variant="body2" sx={{ my: 1 }}>
                  <strong>Diagnosis:</strong> {con.diagnosis}
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    CLINICAL EXAMINATION NOTES:
                  </Typography>
                  <Typography variant="body2">{con.clinicalNotes}</Typography>
                </Paper>
              </Paper>
            ))
          )}
        </Box>
      )}

      {/* Tab 2: Prescriptions */}
      {tabValue === 2 && (
        <Box>
          {patientPrescriptions.map((rx) => (
            <Paper key={rx.id} sx={{ p: 3, mb: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Prescription #{rx.id} — Prescribed by {rx.doctorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Issued Date: {rx.date}
                  </Typography>
                </Box>
                <WorkflowStatusChip status={rx.status} />
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Medication</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Instructions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rx.medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{med.name}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.frequency}</TableCell>
                      <TableCell>{med.duration}</TableCell>
                      <TableCell>{med.instructions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ))}
        </Box>
      )}

      {/* Tab 3: Lab Reports */}
      {tabValue === 3 && (
        <Box>
          {patientLabs.map((lab) => (
            <Paper key={lab.id} sx={{ p: 3, mb: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Lab Order #{lab.id} — Requested by {lab.doctorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Date: {lab.requestedDate}
                  </Typography>
                </Box>
                <WorkflowStatusChip status={lab.status} />
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Result Value</TableCell>
                    <TableCell>Reference Range</TableCell>
                    <TableCell>Flag Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lab.tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{test.name}</TableCell>
                      <TableCell>{test.category}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {test.resultValue ? `${test.resultValue} ${test.unit}` : 'Pending'}
                      </TableCell>
                      <TableCell>{test.referenceRange || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={test.flag || 'Normal'}
                          size="small"
                          color={test.flag === 'High' || test.flag === 'Critical' ? 'error' : 'success'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ))}
        </Box>
      )}

      {/* Tab 4: Billing Ledger */}
      {tabValue === 4 && (
        <Box>
          {patientBilling.map((inv) => (
            <Paper key={inv.id} sx={{ p: 3, mb: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Invoice {inv.invoiceNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Issued: {inv.date} | Due: {inv.dueDate}
                  </Typography>
                </Box>
                <WorkflowStatusChip status={inv.status} />
              </Box>

              <Table size="small" sx={{ mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inv.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">${item.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', minWidth: 260 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    FINANCIAL BREAKDOWN:
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 0.5 }}>
                    <span>Subtotal:</span>
                    <span>${inv.subtotal.toFixed(2)}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main', my: 0.5 }}>
                    <span>Insurance Coverage:</span>
                    <span>-${inv.insuranceDiscount.toFixed(2)}</span>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total Amount Paid/Due:</span>
                    <span>${inv.totalAmount.toFixed(2)}</span>
                  </Box>
                </Paper>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
