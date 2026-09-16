'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  HospitalIcon,
  PersonIcon,
  CheckIcon,
  ArrowForwardIcon,
  AdminIcon,
} from '@/components/common/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { availableUsers } = useAppSelector((state) => state.auth);
  const { items: patients } = useAppSelector((state) => state.patients);

  const [identifier, setIdentifier] = useState('sarah.jenkins@example.com');
  const [password, setPassword] = useState('patient123');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check in availableUsers (Doctor, Nurse, Receptionist, Admin, active Patient)
    const userMatch = availableUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanIdentifier ||
        u.phone.replace(/\s+/g, '') === cleanIdentifier.replace(/\s+/g, '')
    );

    // 2. Check in patients items (in case an activated patient logged in by MRN or phone)
    const patientMatch = patients.find(
      (p) =>
        p.mrn.toLowerCase() === cleanIdentifier ||
        p.phone.replace(/\s+/g, '') === cleanIdentifier.replace(/\s+/g, '') ||
        p.email.toLowerCase() === cleanIdentifier
    );

    if (userMatch) {
      if (userMatch.password && userMatch.password !== cleanPassword) {
        setErrorMessage('Incorrect password. Please verify your credentials.');
        return;
      }
      dispatch(login({ user: userMatch }));
      redirectToRole(userMatch.role);
      return;
    }

    if (patientMatch) {
      if (patientMatch.password && patientMatch.password !== cleanPassword) {
        setErrorMessage('Incorrect password. Please verify your credentials.');
        return;
      }
      const patientUser = {
        id: patientMatch.id,
        name: patientMatch.name,
        email: patientMatch.email,
        phone: patientMatch.phone,
        role: 'patient' as const,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        title: 'Patient (Verified)',
        password: patientMatch.password,
      };
      dispatch(login({ user: patientUser }));
      router.push('/dashboard');
      return;
    }

    setErrorMessage(
      'Account not found. If you registered as a walk-in at reception, please use the "Activate with SMS Code" link below.'
    );
  };

  const redirectToRole = (role: string) => {
    if (role === 'receptionist') router.push('/reception');
    else if (role === 'nurse') router.push('/nurse/triage');
    else if (role === 'doctor') router.push('/appointments');
    else if (role === 'admin') router.push('/admin');
    else router.push('/dashboard');
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    const u = availableUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (u) {
      dispatch(login({ user: u }));
      redirectToRole(u.role);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        py: 6,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        {/* Brand Header */}
        <Box textAlign="center" mb={3}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              mb: 1,
              boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
            }}
          >
            <HospitalIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight={900} color="primary.main">
            SmartClinic Kenya
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Patient Portal & Clinical Healthcare System Sign In
          </Typography>
        </Box>

        {/* Walk-in Callout Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: '#F0FDF4',
            border: '2px solid #86EFAC',
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="success.dark">
              🔑 Walk-In Patient First Visit?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Activate your portal with the Special SMS Code received at reception.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="success"
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => router.push('/patient/activate')}
            sx={{ fontWeight: 700, textTransform: 'none', px: 2, whiteSpace: 'nowrap' }}
          >
            Activate Account
          </Button>
        </Paper>

        {/* Login Card */}
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800} mb={1}>
            Sign In to Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your registered email, phone number, or MRN and password.
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Email, Phone Number, or MRN"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem', mt: 1 }}
                >
                  Sign In
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              OR 1-CLICK DEMO PERSONA LOGIN
            </Typography>
          </Divider>

          {/* Quick Demo Logins */}
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => handleQuickLogin('sarah.jenkins@example.com', 'patient123')}
                sx={{ textTransform: 'none', py: 1 }}
              >
                Patient
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => handleQuickLogin('alex.mercer@smartclinic.co.ke', 'doctor123')}
                sx={{ textTransform: 'none', py: 1 }}
              >
                Doctor
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                color="info"
                size="small"
                onClick={() => handleQuickLogin('riley.davis@smartclinic.co.ke', 'nurse123')}
                sx={{ textTransform: 'none', py: 1 }}
              >
                Nurse
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => handleQuickLogin('kevin.otieno@smartclinic.co.ke', 'reception123')}
                sx={{ textTransform: 'none', py: 1 }}
              >
                Reception
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Dedicated Admin Portal Link */}
        <Box textAlign="center" mt={3}>
          <Paper
            elevation={0}
            onClick={() => router.push('/admin/login')}
            sx={{
              p: 1.5,
              borderRadius: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: '#0F172A',
              color: '#F8FAFC',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            <AdminIcon sx={{ color: '#F59E0B' }} />
            <Typography variant="body2" fontWeight={600}>
              Clinic Governance & Administration Portal &rarr;
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
