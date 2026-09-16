'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import {
  PersonIcon,
  EmergencyIcon,
  SmsIcon,
  CheckIcon,
  RefreshIcon,
} from '@/components/common/Icons';
import { ReceptionistWalkInForm } from '@/components/forms/ReceptionistWalkInForm';
import { EmergencyFastTrackForm } from '@/components/forms/EmergencyFastTrackForm';
import { useAppSelector } from '@/store/hooks';
import { WorkflowStatusChip } from '@/components/common/WorkflowStatusChip';

export default function ReceptionPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { items: patients } = useAppSelector((state) => state.patients);
  const { items: appointments } = useAppSelector((state) => state.appointments);

  // Filter walk-in and emergency admissions
  const recentWalkIns = patients.filter((p) => p.mrn.startsWith('MRN-2026') || p.mrn.startsWith('MRN-EMERGENCY'));
  const emergencyCount = patients.filter((p) => p.isEmergency || p.status === 'Emergency-Unverified').length;
  const credentialCount = patients.filter((p) => p.notificationSent?.sms).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Reception Desk & Walk-In Intake Station
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kenyan Healthcare Front Desk Module: Patient Registration, Automated SMS Credentials Dispatch & Emergency Fast-Track
          </Typography>
        </Box>
        <Chip
          label="Front Desk Active: Receptionist Kevin Otieno"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '6px solid #1976d2' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    WALK-IN ADMISSIONS TODAY
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {recentWalkIns.length}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '6px solid #ef5350' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    EMERGENCY FAST-TRACK CASES
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {emergencyCount}
                  </Typography>
                </Box>
                <EmergencyIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    CREDENTIALS SMS DISPATCHED
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {credentialCount}
                  </Typography>
                </Box>
                <SmsIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Standard Walk-In Registration"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
          />
          <Tab
            icon={<EmergencyIcon sx={{ color: 'error.main' }} />}
            iconPosition="start"
            label="🚨 Red-Zone Emergency Fast-Track"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2, color: 'error.main' }}
          />
          <Tab
            icon={<SmsIcon />}
            iconPosition="start"
            label="SMS / Email Credential Dispatch Log"
            sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
          />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && <ReceptionistWalkInForm />}

          {activeTab === 1 && <EmergencyFastTrackForm />}

          {activeTab === 2 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Medical Record No (MRN)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone / SMS Target</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Temp Portal PIN</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>SMS Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients
                    .filter((p) => p.notificationSent)
                    .map((pat) => (
                      <TableRow key={pat.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{pat.name}</TableCell>
                        <TableCell>
                          <Chip label={pat.mrn} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{pat.phone}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
                            {pat.tempPassword || 'PIN-4819'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Delivered (SmsSasa)"
                            size="small"
                            color="success"
                            icon={<CheckIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Delivered (SMTP)"
                            size="small"
                            color="success"
                            icon={<CheckIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Recent Front Desk Activity Table */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Reception Live Lounge Queue & Triage Handoff
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>MRN</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Assigned Doctor</TableCell>
                <TableCell>Workflow Status</TableCell>
                <TableCell>Registered At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.slice(0, 6).map((apt) => (
                <TableRow key={apt.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{apt.patientName}</TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {apt.patientId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {apt.type === 'Walk-In Emergency' ? (
                      <Chip label="EMERGENCY" color="error" size="small" sx={{ fontWeight: 700 }} />
                    ) : (
                      <Chip label="Walk-In Routine" color="info" variant="outlined" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell>
                    <WorkflowStatusChip status={apt.status} />
                  </TableCell>
                  <TableCell>{apt.createdAt ? new Date(apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:15 AM'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
