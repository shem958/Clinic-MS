'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { ScienceIcon as Science, AddIcon } from '@/components/common/Icons';

import { useAppSelector } from '@/store/hooks';
import { WorkflowStatusChip } from '@/components/common/WorkflowStatusChip';
import { LabResultForm } from '@/components/forms/LabResultForm';
import { LabRequest } from '@/types';

export default function LabsPage() {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { items: labRequests } = useAppSelector((state) => state.labRequests);

  const [activeLabRequest, setActiveLabRequest] = useState<LabRequest | null>(null);

  const isPatient = currentUser.role === 'patient';

  // Strict isolation: patients only see their own lab requests and results
  const userLabs = isPatient
    ? labRequests.filter(
        (l) =>
          l.patientId === currentUser.id ||
          l.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : labRequests;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {isPatient ? 'My Laboratory Reports & Test Results' : 'Laboratory Requests & Test Results'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isPatient
              ? 'View diagnostic lab findings, reference ranges, specimen processing status, and pathologist notes.'
              : 'Diagnostic lab test ordering, specimen processing tracking, and clinical findings entry.'}
          </Typography>
        </Box>
      </Box>

      {/* Lab Requests List */}
      <Grid container spacing={3}>
        {userLabs.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Science sx={{ fontSize: 48, color: 'primary.light', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {isPatient ? 'No Laboratory Results On File' : 'No Lab Requests Found'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isPatient
                  ? 'There are currently no laboratory diagnostic requests or test results ordered for your medical record.'
                  : 'No active laboratory orders registered in the system.'}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          userLabs.map((lab) => (
            <Grid item xs={12} key={lab.id}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Science color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Lab Order #{lab.id} {isPatient ? '' : `— Patient: ${lab.patientName}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ordered by <strong>{lab.doctorName}</strong> on {lab.requestedDate}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WorkflowStatusChip status={lab.status} />
                    {!isPatient &&
                      (currentUser.role === 'nurse' ||
                        currentUser.role === 'doctor' ||
                        currentUser.role === 'admin') &&
                      lab.status === 'Pending' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => setActiveLabRequest(lab)}
                        >
                          Enter Test Findings
                        </Button>
                      )}
                  </Box>
                </Box>

                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Test Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Result Value</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ref Range / Unit</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Flag</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lab.tests.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{t.code}</TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{t.category}</TableCell>
                        <TableCell>
                          {t.resultValue ? (
                            <strong>
                              {t.resultValue} {t.unit}
                            </strong>
                          ) : (
                            <Typography variant="caption" color="text.secondary" fontStyle="italic">
                              Pending Lab Analysis
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{t.referenceRange || 'N/A'}</TableCell>
                        <TableCell>
                          {t.flag ? (
                            <Chip
                              label={t.flag}
                              size="small"
                              color={
                                t.flag === 'Normal' ? 'success' : t.flag === 'Critical' ? 'error' : 'warning'
                              }
                            />
                          ) : (
                            <Chip label="Processing" size="small" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Lab Result Entry Modal (Staff only) */}
      <Dialog
        open={Boolean(activeLabRequest)}
        onClose={() => setActiveLabRequest(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Enter Laboratory Test Findings — Order #{activeLabRequest?.id}
        </DialogTitle>
        <DialogContent dividers>
          {activeLabRequest && (
            <LabResultForm
              labRequest={activeLabRequest}
              onSuccess={() => setActiveLabRequest(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
