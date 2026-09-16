package handlers

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"smart-clinic-backend/models"

	"github.com/gin-gonic/gin"
)

type Store struct {
	mu           sync.Mutex
	Users        []models.User
	Patients     []models.Patient
	TriageLogs   []models.NurseTriageRecord
	Appointments []models.Appointment
	SmsLogs      []models.SmsEmailLog
}

var DB = &Store{
	Users: []models.User{
		{
			ID:       "doc-1",
			Name:     "Dr. Alex Mercer",
			Email:    "alex.mercer@smartclinic.co.ke",
			Role:     models.RoleDoctor,
			Title:    "Consultant Physician",
			Phone:    "+254 722 876543",
			Password: "doctor123",
		},
		{
			ID:       "nurse-1",
			Name:     "Nurse Riley Davis",
			Email:    "riley.davis@smartclinic.co.ke",
			Role:     models.RoleNurse,
			Title:    "Senior Triage Nurse",
			Phone:    "+254 733 456789",
			Password: "nurse123",
		},
		{
			ID:       "recep-1",
			Name:     "Kevin Otieno",
			Email:    "kevin.otieno@smartclinic.co.ke",
			Role:     models.RoleReceptionist,
			Title:    "Front Desk Officer",
			Phone:    "+254 701 234567",
			Password: "reception123",
		},
		{
			ID:       "admin-1",
			Name:     "Chloe Bennett",
			Email:    "chloe.bennett@smartclinic.co.ke",
			Role:     models.RoleAdmin,
			Title:    "Clinic Operations Director",
			Phone:    "+254 711 999888",
			Password: "admin2026",
		},
	},
	Patients: []models.Patient{
		{
			ID:             "pat-1",
			MRN:            "MRN-2026-9812",
			Name:           "Sarah Jenkins",
			Age:            34,
			Gender:         "Female",
			DOB:            "1990-05-14",
			Phone:          "+254 712 345 678",
			Email:          "sarah.j@example.com",
			Address:        "Nairobi, Kenya",
			BloodGroup:     "O+",
			Allergies:      []string{"Penicillin"},
			ActivationCode: "ACT-0041",
			Password:       "patient123",
			IsAccountClaimed: true,
			Insurance: models.InsuranceInfo{
				Provider:     "NHIF / SHA Kenya",
				PolicyNumber: "NHIF-884102",
				Copay:        500,
			},
			EmergencyContact: models.EmergencyContact{
				Name:         "David Jenkins",
				Phone:        "+254 722 999 111",
				Relationship: "Spouse",
			},
			Status:       "Active",
			TempPassword: "PIN-8812",
			NotificationSent: models.NotificationSent{
				SMS:    true,
				Email:  true,
				SentAt: "2026-09-08T09:30:00Z",
			},
		},
	},
	TriageLogs: []models.NurseTriageRecord{
		{
			ID:                    "trg-101",
			PatientID:             "pat-1",
			PatientName:           "Sarah Jenkins",
			NurseID:               "nurse-1",
			NurseName:             "Nurse Riley Davis",
			Timestamp:             "2026-09-08T09:40:00Z",
			BPSystolic:            120,
			BPDiastolic:           80,
			Temperature:           36.7,
			HeightCm:              168,
			WeightKg:              65.5,
			SpO2:                  98,
			PulseRate:             72,
			Priority:              models.PriorityRoutine,
			ChiefComplaintSummary: "Mild headache & persistent fatigue for 3 days",
			NurseNotes:            "Patient stable. Height & BP taken at intake.",
			Status:                "Triaged",
		},
	},
	Appointments: []models.Appointment{
		{
			ID:          "apt-1",
			PatientID:   "pat-1",
			PatientName: "Sarah Jenkins",
			DoctorID:    "doc-1",
			DoctorName:  "Dr. Alex Mercer",
			Specialty:   "General Practice",
			Date:        "2026-09-08",
			TimeSlot:    "10:00 AM",
			Type:        "In-Person",
			Status:      "Triaged-Pending-Doctor",
			Reason:      "Routine Consultation & Vitals Check",
			CreatedAt:   "2026-09-08T09:30:00Z",
		},
	},
	SmsLogs: []models.SmsEmailLog{
		{
			ID:          "log-1",
			PatientName: "Sarah Jenkins",
			Phone:       "+254 712 345 678",
			Email:       "sarah.j@example.com",
			MRN:         "MRN-2026-9812",
			TempPin:     "PIN-8812",
			SMSStatus:   "Delivered",
			EmailStatus: "Delivered",
			SentAt:      "09:30 AM",
		},
	},
}

// GET /api/v1/health
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "Smart Clinic Golang REST API",
		"version":   "1.0.0",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

// GET /api/v1/patients
func GetPatients(c *gin.Context) {
	DB.mu.Lock()
	defer DB.mu.Unlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(DB.Patients),
		"data":    DB.Patients,
	})
}

// POST /api/v1/patients/walk-in
func WalkInOnboarding(c *gin.Context) {
	var req struct {
		Name              string `json:"name" binding:"required"`
		Age               int    `json:"age" binding:"required"`
		Gender            string `json:"gender" binding:"required"`
		Phone             string `json:"phone" binding:"required"`
		Email             string `json:"email" binding:"required"`
		DoctorID          string `json:"doctorId" binding:"required"`
		InsuranceProvider string `json:"insuranceProvider"`
		ReasonForVisit    string `json:"reasonForVisit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	DB.mu.Lock()
	defer DB.mu.Unlock()

	mrn := fmt.Sprintf("MRN-2026-%d", 1000+time.Now().Nanosecond()%9000)
	pin := fmt.Sprintf("PIN-%d", 1000+time.Now().Nanosecond()%9000)
	patID := fmt.Sprintf("pat-%d", time.Now().UnixNano()%10000)

	newPatient := models.Patient{
		ID:         patID,
		MRN:        mrn,
		Name:       req.Name,
		Age:        req.Age,
		Gender:     req.Gender,
		Phone:      req.Phone,
		Email:      req.Email,
		BloodGroup: "B+",
		Insurance: models.InsuranceInfo{
			Provider:     req.InsuranceProvider,
			PolicyNumber: "NHIF-WALKIN",
			Copay:        500,
		},
		Status:       "Active",
		TempPassword: pin,
		NotificationSent: models.NotificationSent{
			SMS:    true,
			Email:  true,
			SentAt: time.Now().Format(time.RFC3339),
		},
	}
	DB.Patients = append(DB.Patients, newPatient)

	// Create Appointment in Nurse Triage Queue
	newApt := models.Appointment{
		ID:          fmt.Sprintf("apt-%d", time.Now().UnixNano()%10000),
		PatientID:   patID,
		PatientName: req.Name,
		DoctorID:    req.DoctorID,
		DoctorName:  "Dr. Alex Mercer",
		Specialty:   "General Practice",
		Date:        time.Now().Format("2006-01-02"),
		TimeSlot:    "Walk-In Lounge",
		Type:        "In-Person",
		Status:      "In-Nurse-Triage",
		Reason:      req.ReasonForVisit,
		CreatedAt:   time.Now().Format(time.RFC3339),
	}
	DB.Appointments = append(DB.Appointments, newApt)

	// Create SMS Log
	smsLog := models.SmsEmailLog{
		ID:          fmt.Sprintf("log-%d", time.Now().UnixNano()%10000),
		PatientName: req.Name,
		Phone:       req.Phone,
		Email:       req.Email,
		MRN:         mrn,
		TempPin:     pin,
		SMSStatus:   "Delivered",
		EmailStatus: "Delivered",
		SentAt:      time.Now().Format("03:04 PM"),
	}
	DB.SmsLogs = append(DB.SmsLogs, smsLog)

	c.JSON(http.StatusCreated, gin.H{
		"success":     true,
		"message":     "Walk-in patient onboarded successfully. SMS & Email credentials dispatched.",
		"patient":     newPatient,
		"appointment": newApt,
		"smsLog":      smsLog,
	})
}

// POST /api/v1/patients/emergency-fast-track
func EmergencyFastTrack(c *gin.Context) {
	var req struct {
		Name           string  `json:"name" binding:"required"`
		Age            int     `json:"age" binding:"required"`
		Gender         string  `json:"gender" binding:"required"`
		ChiefComplaint string  `json:"chiefComplaint" binding:"required"`
		DoctorID       string  `json:"doctorId" binding:"required"`
		ImmediateTemp  float64 `json:"immediateTemp"`
		ImmediateSpO2  int     `json:"immediateSpO2"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	DB.mu.Lock()
	defer DB.mu.Unlock()

	mrn := fmt.Sprintf("MRN-EMERGENCY-%d", 1000+time.Now().Nanosecond()%9000)
	pin := fmt.Sprintf("EMG-%d", 1000+time.Now().Nanosecond()%9000)
	patID := fmt.Sprintf("pat-emg-%d", time.Now().UnixNano()%10000)

	newPatient := models.Patient{
		ID:           patID,
		MRN:          mrn,
		Name:         req.Name,
		Age:          req.Age,
		Gender:       req.Gender,
		Phone:        "+254 700 000 911",
		Email:        "er-responder@smartclinic.co.ke",
		Status:       "Emergency-Unverified",
		IsEmergency:  true,
		TempPassword: pin,
	}
	DB.Patients = append(DB.Patients, newPatient)

	triageRecord := models.NurseTriageRecord{
		ID:                    fmt.Sprintf("trg-emg-%d", time.Now().UnixNano()%10000),
		PatientID:             patID,
		PatientName:           req.Name,
		NurseID:               "nurse-1",
		NurseName:             "Nurse Riley Davis",
		Timestamp:             time.Now().Format(time.RFC3339),
		BPSystolic:            140,
		BPDiastolic:           90,
		Temperature:           req.ImmediateTemp,
		HeightCm:              175,
		WeightKg:              70,
		SpO2:                  req.ImmediateSpO2,
		PulseRate:             110,
		Priority:              models.PriorityEmergency,
		ChiefComplaintSummary: req.ChiefComplaint,
		NurseNotes:            "FAST-TRACK: Intake deferred. Transferred directly to Resuscitation Bay.",
		Status:                "Triaged",
	}
	DB.TriageLogs = append(DB.TriageLogs, triageRecord)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Emergency Red-Zone Fast-Track activated. Routed directly to ER doctor.",
		"patient": newPatient,
		"triage":  triageRecord,
	})
}

// POST /api/v1/triage
func RecordNurseTriage(c *gin.Context) {
	var record models.NurseTriageRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	DB.mu.Lock()
	defer DB.mu.Unlock()

	record.ID = fmt.Sprintf("trg-%d", time.Now().UnixNano()%10000)
	record.Timestamp = time.Now().Format(time.RFC3339)
	record.Status = "Triaged"

	DB.TriageLogs = append(DB.TriageLogs, record)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Nurse Triage Vitals recorded & patient transferred to doctor queue.",
		"data":    record,
	})
}

// GET /api/v1/triage
func GetTriageRecords(c *gin.Context) {
	DB.mu.Lock()
	defer DB.mu.Unlock()
	c.JSON(http.StatusOK, gin.H{"success": true, "count": len(DB.TriageLogs), "data": DB.TriageLogs})
}

// GET /api/v1/appointments
func GetAppointments(c *gin.Context) {
	DB.mu.Lock()
	defer DB.mu.Unlock()
	c.JSON(http.StatusOK, gin.H{"success": true, "count": len(DB.Appointments), "data": DB.Appointments})
}

// GET /api/v1/sms-logs
func GetSmsLogs(c *gin.Context) {
	DB.mu.Lock()
	defer DB.mu.Unlock()
	c.JSON(http.StatusOK, gin.H{"success": true, "count": len(DB.SmsLogs), "data": DB.SmsLogs})
}

// GET /api/v1/rbac/permissions
func GetRBACPermissions(c *gin.Context) {
	permissions := []gin.H{
		{"role": "patient", "permissions": []string{"view_own_emr", "view_own_prescriptions", "view_own_bills", "book_telehealth"}},
		{"role": "nurse", "permissions": []string{"record_triage_vitals", "view_patient_emr", "transfer_to_doctor", "view_lab_orders"}},
		{"role": "doctor", "permissions": []string{"view_triage_vitals", "perform_consultation", "issue_prescriptions", "order_lab_tests"}},
		{"role": "receptionist", "permissions": []string{"register_walkin", "trigger_emergency_fasttrack", "dispatch_sms_credentials", "process_billing"}},
		{"role": "admin", "permissions": []string{"manage_rbac", "view_financial_audit", "manage_staff_roster", "full_system_override"}},
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": permissions})
}

// POST /api/v1/auth/login
func AuthLogin(c *gin.Context) {
	var req struct {
		Identifier string `json:"identifier" binding:"required"`
		Password   string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	DB.mu.Lock()
	defer DB.mu.Unlock()

	// Check staff users
	for _, u := range DB.Users {
		if (u.Email == req.Identifier || u.Phone == req.Identifier) && u.Password == req.Password {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"token":   fmt.Sprintf("jwt-%s-%d", u.Role, time.Now().Unix()),
				"user":    u,
			})
			return
		}
	}

	// Check patient users
	for _, p := range DB.Patients {
		if (p.Email == req.Identifier || p.Phone == req.Identifier || p.MRN == req.Identifier) && p.Password == req.Password {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"token":   fmt.Sprintf("jwt-patient-%d", time.Now().Unix()),
				"user": gin.H{
					"id":    p.ID,
					"name":  p.Name,
					"email": p.Email,
					"phone": p.Phone,
					"role":  "patient",
					"title": "Patient (Verified)",
				},
			})
			return
		}
	}

	c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid identifier or password"})
}

// POST /api/v1/auth/admin-login
func AdminLogin(c *gin.Context) {
	var req struct {
		AdminEmail  string `json:"adminEmail" binding:"required"`
		Password    string `json:"password" binding:"required"`
		SecurityPin string `json:"securityPin"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	DB.mu.Lock()
	defer DB.mu.Unlock()

	for _, u := range DB.Users {
		if u.Role == models.RoleAdmin && u.Email == req.AdminEmail && u.Password == req.Password {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Level-4 Governance Clearance Granted",
				"token":   fmt.Sprintf("admin-jwt-%d", time.Now().Unix()),
				"user":    u,
			})
			return
		}
	}

	c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Administrative Authorization Failed"})
}

// POST /api/v1/patient/activate
func PatientActivate(c *gin.Context) {
	var req struct {
		ActivationCode string `json:"activationCode" binding:"required"`
		Password       string `json:"password" binding:"required"`
		NationalID     string `json:"nationalId"`
		Email          string `json:"email"`
		Phone          string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	DB.mu.Lock()
	defer DB.mu.Unlock()

	for i, p := range DB.Patients {
		if p.ActivationCode == req.ActivationCode || p.MRN == req.ActivationCode || p.TempPassword == req.ActivationCode {
			DB.Patients[i].IsAccountClaimed = true
			DB.Patients[i].Password = req.Password
			if req.NationalID != "" {
				DB.Patients[i].NationalID = req.NationalID
			}
			if req.Email != "" {
				DB.Patients[i].Email = req.Email
			}
			if req.Phone != "" {
				DB.Patients[i].Phone = req.Phone
			}

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Patient account successfully claimed and activated",
				"patient": DB.Patients[i],
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Invalid or unrecognized activation code"})
}
