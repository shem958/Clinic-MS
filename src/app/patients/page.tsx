'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Drawer,
  IconButton,
  Divider,
} from '@mui/material';
import {
  SearchIcon,
  AddIcon,
  PersonIcon,
  AdminIcon as BadgeIcon,
  MedicalIcon,
  CloseIcon,
} from '@/components/common/Icons';

import { useAppSelector } from '@/store/hooks';
import { PatientRegistrationForm } from '@/components/forms/PatientRegistrationForm';

export default function PatientsDirectoryPage() {
  const router = useRouter();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { items: patients } = useAppSelector((state) => state.patients);

  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [registerDrawerOpen, setRegisterDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (currentUser.role === 'patient') {
      router.push('/dashboard');
    }
  }, [currentUser.role, router]);

  if (currentUser.role === 'patient') {
    return null;
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBloodGroup = bloodGroupFilter === 'All' || patient.bloodGroup === bloodGroupFilter;
    return matchesSearch && matchesBloodGroup;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Patient EMR Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Central Electronic Medical Records repository and demographic database.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setRegisterDrawerOpen(true)}
        >
          Register New Patient
        </Button>
      </Box>

      {/* Filter & Search Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by patient name, MRN (e.g. MRN-2026-0041), email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              select
              label="Filter by Blood Group"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
            >
              <MenuItem value="All">All Blood Types</MenuItem>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <MenuItem key={bg} value={bg}>
                  Blood Type: {bg}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Patient Cards Grid */}
      <Grid container spacing={3}>
        {filteredPatients.map((patient) => (
          <Grid item xs={12} sm={6} md={4} key={patient.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50, fontWeight: 700 }}>
                      {patient.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {patient.name}
                      </Typography>
                      <Chip label={patient.mrn} size="small" color="primary" variant="outlined" />
                    </Box>
                  </Box>
                  <Chip
                    label={patient.bloodGroup}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  <div>
                    <strong>Demographics:</strong> {patient.age} yrs | {patient.gender} | DOB: {patient.dob}
                  </div>
                  <div>
                    <strong>Contact:</strong> {patient.phone}
                  </div>
                  <div>
                    <strong>Insurance:</strong> {patient.insurance.provider} (Policy: {patient.insurance.policyNumber})
                  </div>
                  {patient.allergies.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block' }}>
                        Allergies:
                      </Typography>
                      {patient.allergies.map((alg) => (
                        <Chip key={alg} label={alg} size="small" color="error" variant="outlined" sx={{ mr: 0.5, mt: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<MedicalIcon />}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  View Full EMR Profile
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Registration Drawer */}
      <Drawer
        anchor="right"
        open={registerDrawerOpen}
        onClose={() => setRegisterDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 600 }, p: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Register New Patient EMR
          </Typography>
          <IconButton onClick={() => setRegisterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <PatientRegistrationForm onSuccess={() => setRegisterDrawerOpen(false)} />
      </Drawer>
    </Box>
  );
}
