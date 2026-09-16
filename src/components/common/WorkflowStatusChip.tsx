'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  ScheduleIcon as Schedule,
  CheckCircleIcon as CheckCircle,
  PlayArrowIcon as PlayCircle,
  CancelIcon as Cancel,
  BillingIcon as Receipt,
  ScienceIcon as Science,
  PrescriptionIcon as LocalPharmacy,
} from '@/components/common/Icons';



interface WorkflowStatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export const WorkflowStatusChip: React.FC<WorkflowStatusChipProps> = ({ status, size = 'small' }) => {
  let color: ChipProps['color'] = 'default';
  let icon = <Schedule fontSize="small" />;
  let label = status;

  switch (status) {
    case 'Requested':
    case 'Pending':
    case 'Unpaid':
      color = 'warning';
      icon = <Schedule fontSize="small" />;
      break;

    case 'Approved':
    case 'Processing':
    case 'Issued':
    case 'Partially Paid':
      color = 'info';
      icon = <PlayCircle fontSize="small" />;
      break;

    case 'In-Consultation':
    case 'In-Progress':
      color = 'secondary';
      icon = <Science fontSize="small" />;
      break;

    case 'Completed':
    case 'Paid':
    case 'Dispensed':
      color = 'success';
      icon = <CheckCircle fontSize="small" />;
      break;

    case 'Cancelled':
    case 'Rejected':
    case 'Overdue':
      color = 'error';
      icon = <Cancel fontSize="small" />;
      break;

    case 'Refill-Requested':
      color = 'warning';
      icon = <LocalPharmacy fontSize="small" />;
      break;

    default:
      color = 'default';
  }

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      icon={icon}
      variant="outlined"
      sx={{ fontWeight: 600, px: 0.5 }}
    />
  );
};
