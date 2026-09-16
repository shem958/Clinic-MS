# 🏥 Smart Clinic Management & Patient Portal (Clinic-MS)

A full-stack clinic management and patient portal designed specifically around real-world **Kenyan healthcare clinical workflows**: Walk-In Reception Intake, Automated SMS Activation Codes, Nurse Pre-Consultation Triage Vitals, Doctor EMR Consultations, Emergency Red-Zone Fast-Track, and 5-Role RBAC Governance.

---

## 🌟 Key Highlights & Clinical Pathways

- **Kenya-Specific Triage Workflow**:
  Before seeing a doctor, patients undergo nursing physical examinations where vital signs are recorded:
  - Blood Pressure (Systolic / Diastolic)
  - Body Temperature (°C)
  - Height (cm) & Weight (kg) -> Automatic BMI calculation
  - Pulse Rate (bpm) & Oxygen Saturation SpO2 (%)
  - Triage Priority Classification: *Routine*, *Urgent*, or *Emergency*

- **Reception Walk-In Intake & Automated SMS Credentials**:
  - Receptionists register walk-in patients in seconds.
  - Automatically generates a unique Medical Record Number (MRN) and **Special Activation Code** (e.g. ACT-0041).
  - Dispatches simulated SMS/Email notifications with credentials and direct activation links.

- **Patient Self-Service Account Claiming**:
  - Walk-in patients visit /patient/activate, enter their SMS code, verify phone number, and complete their profile by entering National ID and setting a permanent password.
  - Subsequent visits use the standard /login page with MRN/Email.

- **Strict Patient Privacy Constraints**:
  - Patients only see their own clinical records and invoices.
  - Allowed 5 tabs: **Dashboard**, **Appointments Queue** (shows queue position token #1, #2 rather than public roster), **Prescriptions**, **Lab Results**, and **Billing & Invoices**.
  - Patient EMR Directory is forbidden for patients.

- **Red-Zone Emergency Fast-Track**:
  - Immediate bypass of routine paperwork for critical trauma arrivals.
  - 1-click bedside vitals intake and instantaneous clinical alert broadcasting.

- **Separate Admin Governance Portal**:
  - Isolated /admin/login page with Level-4 clearance, executive branding, and hardware 2FA code simulation.
  - Full financial analytics (KES billed/collected) and interactive 5-role RBAC permission matrix.

---

## 🏗️ System Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI (MUI v5)
- **State Management**: Redux Toolkit (RTK) with typed hooks
- **Form Management & Validation**: Formik + Yup
- **Icons**: Custom optimized SVG Icon set

### Backend
- **Language & Runtime**: Golang 1.22+
- **HTTP Framework**: Gin Web Framework (github.com/gin-gonic/gin)
- **API Documentation**: OpenAPI / Swagger 2.0 (/swagger/index.html)
- **CORS**: Fully configured for cross-origin frontend communication

---

## 👥 Supported Roles & Demo Personas

| Role | Persona | Email / Identifier | Password | Default Route |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Sarah Jenkins | sarah.jenkins@example.com *(or MRN MRN-2026-9812)* | patient123 | /dashboard |
| **Nurse** | Riley Davis | iley.davis@smartclinic.co.ke | 
urse123 | /nurse/triage |
| **Doctor** | Dr. Alex Mercer | lex.mercer@smartclinic.co.ke | doctor123 | /appointments |
| **Receptionist** | Kevin Otieno | kevin.otieno@smartclinic.co.ke | eception123 | /reception |
| **Administrator** | Chloe Bennett | chloe.bennett@smartclinic.co.ke | dmin2026 *(PIN: 941208)* | /admin |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Go 1.20+ (for running the Go backend server)
- Git

### 1. Clone the Repository
`ash
git clone https://github.com/shem958/Clinic-MS.git
cd Clinic-MS
`

### 2. Frontend Setup (Next.js)
`ash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build and run production server
npm run build
npm start
`
The frontend portal will be available at [http://localhost:3000](http://localhost:3000).

### 3. Backend Setup (Golang Gin REST API)
`ash
cd go-backend

# Download modules
go mod download

# Run the API server
go run main.go
`
The REST API server will run on [http://localhost:8080](http://localhost:8080).

---

## 📖 API Documentation (Swagger UI)

When the Go backend is running, access the interactive Swagger documentation and test console at:
👉 **[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)**

### Key API Endpoints
- POST /api/v1/auth/login: Regular user sign-in (Patient, Doctor, Nurse, Receptionist)
- POST /api/v1/auth/admin-login: High-clearance administrative governance sign-in
- POST /api/v1/patient/activate: Walk-in patient account claiming via SMS activation code
- GET /api/v1/patients: Patient EMR records directory
- POST /api/v1/patients/walk-in: Front desk intake & credential dispatch
- POST /api/v1/patients/emergency-fast-track: Red-zone bypass
- GET /api/v1/triage: Nursing triage vitals logbook
- POST /api/v1/triage: Record patient bedside vitals
- GET /api/v1/appointments: Appointments queue
- GET /api/v1/sms-logs: SMS/Email dispatch audit trail
- GET /api/v1/rbac/permissions: Role-based access control matrix

---

## 📄 License
This project is licensed under the MIT License.
