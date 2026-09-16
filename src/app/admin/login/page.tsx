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
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  AdminIcon,
  CheckIcon,
  ArrowForwardIcon,
  HospitalIcon,
} from '@/components/common/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { availableUsers } = useAppSelector((state) => state.auth);

  const [adminEmail, setAdminEmail] = useState('chloe.bennett@smartclinic.co.ke');
  const [password, setPassword] = useState('admin2026');
  const [securityPin, setSecurityPin] = useState('941208');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPassword = password.trim();

    const adminUser = availableUsers.find(
      (u) => u.role === 'admin' && (u.email.toLowerCase() === cleanEmail || cleanEmail.includes('admin'))
    );

    if (!adminUser) {
      setErrorMessage('Access Denied: Unrecognized Administrative Credential.');
      return;
    }

    if (adminUser.password && adminUser.password !== cleanPassword) {
      setErrorMessage('Security Alert: Invalid Administrative Passphrase.');
      return;
    }

    dispatch(login({ user: adminUser }));
    router.push('/admin');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0B0F19',
        py: 6,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        {/* Admin Header */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#1E293B',
              border: '2px solid #F59E0B',
              color: '#F59E0B',
              mb: 1.5,
              boxShadow: '0 8px 30px rgba(245, 158, 11, 0.25)',
            }}
          >
            <AdminIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h4" fontWeight={900} color="#F8FAFC">
            SmartClinic Governance
          </Typography>
          <Typography variant="subtitle2" color="#94A3B8">
            Executive Management, Audit & RBAC Administration Console
          </Typography>
          <Chip
            label="RESTRICTED ADMINISTRATIVE AREA"
            size="small"
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.15)',
              color: '#F59E0B',
              fontWeight: 800,
              fontSize: '0.7rem',
              mt: 1,
              letterSpacing: 1,
            }}
          />
        </Box>

        {/* Admin Card */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            bgcolor: '#111827',
            border: '1px solid #1F2937',
            color: '#F9FAFB',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={800} color="#F3F4F6">
              Administrative Sign In
            </Typography>
            <Chip label="Level-4 Clearance" size="small" color="secondary" />
          </Box>

          <Typography variant="body2" color="#9CA3AF" mb={3}>
            Enter authorized clinic director credentials and hardware token PIN.
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleAdminLogin}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Administrator Email / ID"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#F9FAFB',
                      '& fieldset': { borderColor: '#374151' },
                      '&:hover fieldset': { borderColor: '#9CA3AF' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Governance Master Passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#F9FAFB',
                      '& fieldset': { borderColor: '#374151' },
                      '&:hover fieldset': { borderColor: '#9CA3AF' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Security Key / 2FA Token Code"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  helperText="Simulated hardware authenticator clearance token"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#F9FAFB',
                      '& fieldset': { borderColor: '#374151' },
                      '&:hover fieldset': { borderColor: '#9CA3AF' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                    '& .MuiFormHelperText-root': { color: '#6B7280' },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.6,
                    fontWeight: 800,
                    bgcolor: '#F59E0B',
                    color: '#0F172A',
                    '&:hover': { bgcolor: '#D97706' },
                  }}
                >
                  Authorize & Access Governance Console
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#374151' }} />

          <Box textAlign="center">
            <Button
              variant="text"
              onClick={() => router.push('/login')}
              sx={{ color: '#9CA3AF', textTransform: 'none', fontWeight: 600 }}
            >
              &larr; Return to General Staff & Patient Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
