export type UserRole = 'patient' | 'doctor' | 'nurse' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  phone: string;
  specialty?: string;
  department?: string;
  password?: string;
}

export type TriagePriority = 'Emergency' | 'Urgent' | 'Routine';

export interface NurseTriageRecord {
  id: string;
  patientId: string;
  patientName: string;
  nurseId: string;
  nurseName: string;
  timestamp: string;
  bpSystolic: number;
  bpDiastolic: number;
  temperature: number;
  heightCm: number;
  weightKg: number;
  spo2: number;
  pulseRate: number;
  priority: TriagePriority;
  chiefComplaintSummary: string;
  nurseNotes?: string;
  status: 'Triaged' | 'Transferred-To-Doctor';
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    copay: number;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'Active' | 'Inactive' | 'Emergency-Unverified';
  isEmergency?: boolean;
  tempPassword?: string;
  activationCode?: string;
  isAccountClaimed?: boolean;
  password?: string;
  nationalId?: string;
  notificationSent?: {
    sms: boolean;
    email: boolean;
    sentAt?: string;
  };
}

export type AppointmentStatus =
  | 'Registered'
  | 'In-Nurse-Triage'
  | 'Triaged-Pending-Doctor'
  | 'Approved'
  | 'In-Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  type: 'In-Person' | 'Telehealth' | 'Follow-up' | 'Walk-In Emergency';
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  triageRecord?: NurseTriageRecord;
  createdAt: string;
}

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  temperature: number;
  weightKg: number;
  heightCm: number;
  spo2: number;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals: Vitals;
  triageId?: string;
  diagnosis: string;
  icdCode?: string;
  clinicalNotes: string;
  prescriptionIds: string[];
  labRequestIds: string[];
  status: 'In-Progress' | 'Completed';
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: MedicationItem[];
  status: 'Issued' | 'Dispensed' | 'Refill-Requested';
  notes?: string;
}

export interface LabTestItem {
  id: string;
  code: string;
  name: string;
  category: string;
  status: 'Pending' | 'Completed';
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface LabRequest {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  tests: LabTestItem[];
  requestedDate: string;
  completedDate?: string;
  status: 'Pending' | 'Processing' | 'Completed';
  labTechNotes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Medication' | 'Lab Test' | 'Facility Fee' | 'Nurse Triage Fee';
  cost: number;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  consultationId?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  insuranceDiscount: number;
  tax: number;
  totalAmount: number;
  status: 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue';
  paymentMethod?: 'Credit Card' | 'M-Pesa' | 'Insurance Direct' | 'Cash' | 'Bank Transfer';
  paidAt?: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  roleTarget?: UserRole;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  timestamp: string;
  read: boolean;
}

export interface SmsEmailLog {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  mrn: string;
  tempPin: string;
  smsStatus: 'Sent' | 'Delivered' | 'Failed';
  emailStatus: 'Sent' | 'Delivered' | 'Failed';
  sentAt: string;
}
