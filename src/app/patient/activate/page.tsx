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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  HospitalIcon,
  CheckIcon,
  PersonIcon,
  LockIcon,
  CheckCircleIcon,
  ArrowForwardIcon,
} from '@/components/common/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { claimPatientAccount } from '@/store/slices/patientsSlice';
import { registerAndLoginPatient } from '@/store/slices/authSlice';
import { Patient } from '@/types';

export default function PatientActivatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: patients } = useAppSelector((state) => state.patients);

  const [activeStep, setActiveStep] = useState(0);
  const [activationCode, setActivationCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [matchedPatient, setMatchedPatient] = useState<Patient | null>(null);

  // Step 2 Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanCode = activationCode.trim().toUpperCase();
    const cleanPhone = phone.trim();

    // Look for matching patient by activation code, MRN, or temp password
    const found = patients.find(
      (p) =>
        (p.activationCode && p.activationCode.toUpperCase() === cleanCode) ||
        p.mrn.toUpperCase() === cleanCode ||
        (p.tempPassword && p.tempPassword.toUpperCase() === cleanCode)
    );

    if (!found) {
      setErrorMessage(
        'Invalid or unrecognized activation code. Please check the SMS sent to your phone or consult the reception desk.'
      );
      return;
    }

    setMatchedPatient(found);
    setEmail(found.email || '');
    setPhone(found.phone || '');
    setActiveStep(1);
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the clinic privacy terms and patient consent.');
      return;
    }

    if (!matchedPatient) return;

    // 1. Update patient EMR record in state
    dispatch(
      claimPatientAccount({
        patientId: matchedPatient.id,
        password,
        nationalId,
        email,
        phone,
      })
    );

    // 2. Set as authenticated patient user in auth state
    dispatch(
      registerAndLoginPatient({
        id: matchedPatient.id,
        name: matchedPatient.name,
        email: email || matchedPatient.email,
        phone: phone || matchedPatient.phone,
        password,
      })
    );

    setActiveStep(2);
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
      <Container maxWidth="md">
        {/* Brand Header */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              mb: 1.5,
              boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
            }}
          >
            <HospitalIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight={900} color="primary.main">
            SmartClinic Kenya
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Patient Portal First-Time Account Activation
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            <Step completed={activeStep > 0}>
              <StepLabel>Enter SMS Code</StepLabel>
            </Step>
            <Step completed={activeStep > 1}>
              <StepLabel>Set Personal Password</StepLabel>
            </Step>
            <Step completed={activeStep === 2}>
              <StepLabel>Account Ready</StepLabel>
            </Step>
          </Stepper>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {/* STEP 1: VERIFY CODE */}
          {activeStep === 0 && (
            <Box component="form" onSubmit={handleVerifyCode}>
              <Box mb={3} textAlign="center">
                <Typography variant="h6" fontWeight={800} mb={0.5}>
                  Activate with Your Reception Code
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter the Special Activation Code or Temporary PIN sent to your phone via SMS when you registered at reception.
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Special Activation Code / MRN"
                    placeholder="e.g. ACT-0089 or MRN-2026-0089"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    helperText="Check your SMS message from SmartClinic (SmsSasa gateway)"
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
                    label="Registered Phone Number (Optional)"
                    placeholder="+254 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>

                {/* Quick Demo Pre-fill helper */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, bgcolor: '#F0FDF4', borderColor: '#86EFAC', borderRadius: 2 }}
                  >
                    <Typography variant="caption" fontWeight={700} color="success.dark" display="block" mb={0.5}>
                      💡 QUICK DEMO ACTIVATION CODES:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => {
                          setActivationCode('ACT-0089');
                          setPhone('+254 721 888121');
                        }}
                      >
                        Use Robert Chen (Code: ACT-0089)
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => {
                          setActivationCode('MRN-2026-0089');
                        }}
                      >
                        Use MRN (MRN-2026-0089)
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem' }}
                  >
                    Verify Code & Proceed
                  </Button>
                </Grid>

                <Grid item xs={12} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have an activated account?{' '}
                    <Button
                      variant="text"
                      onClick={() => router.push('/login')}
                      sx={{ fontWeight: 700, textTransform: 'none' }}
                    >
                      Sign In Here
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* STEP 2: PROFILE & PASSWORD SETUP */}
          {activeStep === 1 && matchedPatient && (
            <Box component="form" onSubmit={handleCompleteSetup}>
              <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
                Patient record verified! Welcome, <strong>{matchedPatient.name}</strong> (MRN: {matchedPatient.mrn})
              </Alert>

              <Typography variant="h6" fontWeight={800} mb={1}>
                Complete Your Personal Account Credentials
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Choose a secure password and verify your details. You will use these credentials to log in on future visits.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={matchedPatient.name}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Medical Record Number (MRN)"
                    value={matchedPatient.mrn}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="National ID / Passport No"
                    placeholder="e.g. ID-38910412"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Create Permanent Password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Confirm Password"
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I confirm that this personal medical profile belongs to me and I agree to Smart Clinic Kenya privacy terms.
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    endIcon={<CheckCircleIcon />}
                    sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem' }}
                  >
                    Activate My Account & Log In
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* STEP 3: ACTIVATION COMPLETE & AUTO-LOGIN */}
          {activeStep === 2 && (
            <Box textAlign="center" py={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  color: 'white',
                  mb: 2,
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
                }}
              >
                <CheckIcon sx={{ fontSize: 44 }} />
              </Box>

              <Typography variant="h4" fontWeight={900} color="success.dark" mb={1}>
                Account Successfully Activated!
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={500} mx="auto" mb={3}>
                Congratulations, {matchedPatient?.name}! Your personalized Patient Portal is now ready. You can now log in anytime with your phone number and password.
              </Typography>

              <Card variant="outlined" sx={{ maxWidth: 450, mx: 'auto', mb: 4, bgcolor: '#F8FAFC', textAlign: 'left' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    YOUR VERIFIED CREDENTIALS:
                  </Typography>
                  <Typography variant="body2" my={0.5}>
                    <strong>Login Identifier / Phone:</strong> {phone || matchedPatient?.phone}
                  </Typography>
                  <Typography variant="body2" mb={0.5}>
                    <strong>Medical Record Number:</strong> {matchedPatient?.mrn}
                  </Typography>
                  <Chip label="Account Status: Claimed & Active" color="success" size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/dashboard')}
                sx={{ py: 1.5, px: 5, fontWeight: 800, fontSize: '1.05rem' }}
              >
                Enter My Patient Portal
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
