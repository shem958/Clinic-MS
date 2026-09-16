'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  AdminIcon,
  BillingIcon,
  PeopleIcon,
  HospitalIcon,
  CheckIcon,
  CloseIcon,
  PersonIcon,
} from '@/components/common/Icons';
import { useAppSelector } from '@/store/hooks';

interface RBACPermission {
  module: string;
  patient: string;
  doctor: string;
  nurse: string;
  receptionist: string;
  admin: string;
}

const RBAC_MATRIX: RBACPermission[] = [
  {
    module: 'Walk-In Intake & Patient Account Creation',
    patient: 'Self Signup Only',
    doctor: 'View Queue',
    nurse: 'View Queue',
    receptionist: 'Full Access (Create/SMS Credentials)',
    admin: 'Full Access',
  },
  {
    module: 'Red-Zone Emergency Fast-Track Bypass',
    patient: 'No Access',
    doctor: 'Receive Urgent Alert',
    nurse: 'Create/Bedside Vitals',
    receptionist: 'Instant 1-Click Bypass',
    admin: 'Full Access & Override',
  },
  {
    module: 'Nurse Triage Vitals (BP, Temp, Weight, SpO2)',
    patient: 'View Own Vitals',
    doctor: 'View Consultation Vitals',
    nurse: 'Full Access (Record & Transfer)',
    receptionist: 'View Queue Status',
    admin: 'Full Access',
  },
  {
    module: 'Doctor Consultation, Diagnosis & Notes',
    patient: 'View Discharge Summary',
    doctor: 'Full Access (Diagnose, ICD-10)',
    nurse: 'View Care Instructions',
    receptionist: 'View Booking Status',
    admin: 'Full Access / Audit Log',
  },
  {
    module: 'Prescriptions & Lab Orders',
    patient: 'View Active Meds / Results',
    doctor: 'Full Access (Order & Issue)',
    nurse: 'View Orders',
    receptionist: 'View Test Charges',
    admin: 'Full Access',
  },
  {
    module: 'Billing Invoices & M-Pesa Payment Entry',
    patient: 'View & Pay Invoices',
    doctor: 'View Charge Items',
    nurse: 'No Access',
    receptionist: 'Full Access (Collect Cash/M-Pesa)',
    admin: 'Full Financial Control',
  },
  {
    module: 'Role-Based System Access & User Roster',
    patient: 'No Access',
    doctor: 'No Access',
    nurse: 'No Access',
    receptionist: 'No Access',
    admin: 'Full RBAC Governance',
  },
];

export default function AdminPage() {
  const { availableUsers } = useAppSelector((state) => state.auth);
  const { items: billing } = useAppSelector((state) => state.billing);

  const totalBilled = billing.reduce((acc, i) => acc + i.subtotal, 0);
  const totalCollected = billing.filter((i) => i.status === 'Paid').reduce((acc, i) => acc + i.totalAmount, 0);
  const totalOutstanding = billing.filter((i) => i.status === 'Unpaid').reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Clinic Administration & Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            High-level metrics, revenue collection, 5-role staff roster, and RBAC permission matrix.
          </Typography>
        </Box>
        <Chip label="Governance Mode: Active" color="secondary" sx={{ fontWeight: 700 }} />
      </Box>

      {/* Financial Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '6px solid #1976d2' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 48, height: 48 }}>
                <BillingIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  GROSS BILLED SERVICES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  KES {(totalBilled * 130).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 48, height: 48 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  COLLECTED REVENUE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                  KES {(totalCollected * 130).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ borderRadius: 3, borderLeft: '6px solid #ef5350' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.50', color: 'error.main', width: 48, height: 48 }}>
                <AdminIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  OUTSTANDING RECEIVABLES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main' }}>
                  KES {(totalOutstanding * 130).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Role-Based Access Control (RBAC) Matrix UI */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <AdminIcon color="secondary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              RBAC Permission Matrix (5 System Roles)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Defines resource permissions and feature isolation for Patient, Doctor, Nurse, Receptionist, and Admin.
            </Typography>
          </Box>
        </Box>

        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Resource / Feature Module</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Patient
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Doctor
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Nurse
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Receptionist
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Admin
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {RBAC_MATRIX.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.module}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.patient}
                    size="small"
                    color={row.patient.includes('No Access') ? 'default' : 'success'}
                    variant={row.patient.includes('No Access') ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.doctor}
                    size="small"
                    color={row.doctor.includes('No Access') ? 'default' : 'primary'}
                    variant={row.doctor.includes('No Access') ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.nurse}
                    size="small"
                    color={row.nurse.includes('No Access') ? 'default' : 'info'}
                    variant={row.nurse.includes('No Access') ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.receptionist}
                    size="small"
                    color={row.receptionist.includes('No Access') ? 'default' : 'warning'}
                    variant={row.receptionist.includes('No Access') ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip label={row.admin} size="small" color="secondary" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Staff & Practitioners List */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Clinic Active Roster & Personas (5 Active Roles)
        </Typography>

        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Staff Member / Patient</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Title / Specialty</TableCell>
              <TableCell>Contact Phone</TableCell>
              <TableCell>Access Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {user.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role.toUpperCase()}
                    size="small"
                    color={
                      user.role === 'doctor'
                        ? 'primary'
                        : user.role === 'admin'
                        ? 'secondary'
                        : user.role === 'nurse'
                        ? 'info'
                        : user.role === 'receptionist'
                        ? 'warning'
                        : 'success'
                    }
                  />
                </TableCell>
                <TableCell>{user.title}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Chip label="RBAC Active" size="small" variant="outlined" color="success" icon={<CheckIcon />} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
