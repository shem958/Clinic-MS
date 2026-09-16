package models

type UserRole string

const (
	RolePatient      UserRole = "patient"
	RoleDoctor       UserRole = "doctor"
	RoleNurse        UserRole = "nurse"
	RoleReceptionist UserRole = "receptionist"
	RoleAdmin        UserRole = "admin"
)

type User struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Email      string   `json:"email"`
	Role       UserRole `json:"role"`
	Avatar     string   `json:"avatar"`
	Title      string   `json:"title"`
	Phone      string   `json:"phone"`
	Specialty  string   `json:"specialty,omitempty"`
	Department string   `json:"department,omitempty"`
	Password   string   `json:"password,omitempty"`
}

type TriagePriority string

const (
	PriorityEmergency TriagePriority = "Emergency"
	PriorityUrgent    TriagePriority = "Urgent"
	PriorityRoutine   TriagePriority = "Routine"
)

type NurseTriageRecord struct {
	ID                    string         `json:"id"`
	PatientID             string         `json:"patientId"`
	PatientName           string         `json:"patientName"`
	NurseID               string         `json:"nurseId"`
	NurseName             string         `json:"nurseName"`
	Timestamp             string         `json:"timestamp"`
	BPSystolic            int            `json:"bpSystolic"`
	BPDiastolic           int            `json:"bpDiastolic"`
	Temperature           float64        `json:"temperature"`
	HeightCm              float64        `json:"heightCm"`
	WeightKg              float64        `json:"weightKg"`
	SpO2                  int            `json:"spo2"`
	PulseRate             int            `json:"pulseRate"`
	Priority              TriagePriority `json:"priority"`
	ChiefComplaintSummary string         `json:"chiefComplaintSummary"`
	NurseNotes            string         `json:"nurseNotes,omitempty"`
	Status                string         `json:"status"` // "Triaged" | "Transferred-To-Doctor"
}

type InsuranceInfo struct {
	Provider     string  `json:"provider"`
	PolicyNumber string  `json:"policyNumber"`
	Copay        float64 `json:"copay"`
}

type EmergencyContact struct {
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Relationship string `json:"relationship"`
}

type NotificationSent struct {
	SMS    bool   `json:"sms"`
	Email  bool   `json:"email"`
	SentAt string `json:"sentAt,omitempty"`
}

type Patient struct {
	ID               string           `json:"id"`
	MRN              string           `json:"mrn"`
	Name             string           `json:"name"`
	Age              int              `json:"age"`
	Gender           string           `json:"gender"`
	DOB              string           `json:"dob"`
	Phone            string           `json:"phone"`
	Email            string           `json:"email"`
	Address          string           `json:"address"`
	BloodGroup       string           `json:"bloodGroup"`
	Allergies        []string         `json:"allergies"`
	MedicalHistory   []string         `json:"medicalHistory"`
	Insurance        InsuranceInfo    `json:"insurance"`
	EmergencyContact EmergencyContact `json:"emergencyContact"`
	Status           string           `json:"status"` // "Active" | "Emergency-Unverified"
	IsEmergency      bool             `json:"isEmergency,omitempty"`
	TempPassword     string           `json:"tempPassword,omitempty"`
	ActivationCode   string           `json:"activationCode,omitempty"`
	IsAccountClaimed bool             `json:"isAccountClaimed,omitempty"`
	Password         string           `json:"password,omitempty"`
	NationalID       string           `json:"nationalId,omitempty"`
	NotificationSent NotificationSent `json:"notificationSent,omitempty"`
}

type Appointment struct {
	ID          string             `json:"id"`
	PatientID   string             `json:"patientId"`
	PatientName string             `json:"patientName"`
	DoctorID    string             `json:"doctorId"`
	DoctorName  string             `json:"doctorName"`
	Specialty   string             `json:"specialty"`
	Date        string             `json:"date"`
	TimeSlot    string             `json:"timeSlot"`
	Type        string             `json:"type"` // "In-Person" | "Walk-In Emergency"
	Status      string             `json:"status"`
	Reason      string             `json:"reason"`
	Notes       string             `json:"notes,omitempty"`
	Triage      *NurseTriageRecord `json:"triageRecord,omitempty"`
	CreatedAt   string             `json:"createdAt"`
}

type Vitals struct {
	BPSystolic  int     `json:"bpSystolic"`
	BPDiastolic int     `json:"bpDiastolic"`
	HeartRate   int     `json:"heartRate"`
	Temperature float64 `json:"temperature"`
	WeightKg    float64 `json:"weightKg"`
	HeightCm    float64 `json:"heightCm"`
	SpO2        int     `json:"spo2"`
}

type Consultation struct {
	ID             string   `json:"id"`
	AppointmentID  string   `json:"appointmentId"`
	PatientID      string   `json:"patientId"`
	PatientName    string   `json:"patientName"`
	DoctorID       string   `json:"doctorId"`
	DoctorName     string   `json:"doctorName"`
	Date           string   `json:"date"`
	ChiefComplaint string   `json:"chiefComplaint"`
	Symptoms       []string `json:"symptoms"`
	Vitals         Vitals   `json:"vitals"`
	Diagnosis      string   `json:"diagnosis"`
	ICDCode        string   `json:"icdCode,omitempty"`
	ClinicalNotes  string   `json:"clinicalNotes"`
	Status         string   `json:"status"`
}

type SmsEmailLog struct {
	ID          string `json:"id"`
	PatientName string `json:"patientName"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	MRN         string `json:"mrn"`
	TempPin     string `json:"tempPin"`
	SMSStatus   string `json:"smsStatus"`
	EmailStatus string `json:"emailStatus"`
	SentAt      string `json:"sentAt"`
}
