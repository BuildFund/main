# Onboarding Chatbot System - Implementation Complete

## Overview
A comprehensive onboarding system has been implemented that guides users through profile completion using a friendly chatbot interface. The system collects UK-compliant financial application data, verifies information via APIs, and tracks progress across sessions.

## Features Implemented

### 1. **Chatbot Interface**
- Conversational, friendly chatbot that guides users through data collection
- Appears automatically on first login if profile is incomplete
- Can be dismissed and resumed at any time
- Progress is saved between sessions
- Non-intrusive reminders on dashboard

### 2. **Data Collection**
The system collects the following information based on user role:

#### For Borrowers:
- Profile: Name, date of birth, nationality
- Contact: Phone number
- Address: Full address with postcode
- Company: Registration number, company details
- Director verification
- Financial: Annual income, employment status, monthly expenses
- Experience: Years of experience, previous projects
- Documents: Proof of identity, proof of address

#### For Lenders:
- Profile: Name
- Contact: Phone number
- Address: Full address with postcode
- Company: Registration number, company details
- FCA registration
- Financial licences
- Key personnel
- Documents

#### For Admins:
- Profile: Name
- Contact: Phone number

### 3. **Verification Services**

#### HMRC/Companies House API Integration
- Verifies company registration numbers
- Validates company names
- Checks company status (Active, Dissolved, etc.)
- Verifies director information
- Stores verification results and timestamps

#### Google Maps API Integration
- Verifies UK addresses using postcode lookup
- Validates address components
- Provides formatted addresses
- Calculates confidence scores
- Stores verification data

### 4. **Progress Tracking**
- Real-time progress percentage calculation
- Section-based completion tracking:
  - Profile complete
  - Contact complete
  - Address complete (with verification)
  - Company complete (with verification)
  - Financial complete
  - Documents complete
- Overall verification score (0-100)
- Progress displayed on dashboard
- Banner shows completion percentage and remaining items

### 5. **File Upload**
- Drag and drop file upload interface
- Multiple file support
- Visual feedback during upload
- Files stored via documents API
- Integrated into chatbot flow

### 6. **Session Management**
- Each user has an onboarding session
- Conversation history is saved
- Collected data persists across sessions
- Users can exit and resume anytime
- Session automatically resumes on next login

### 7. **Dashboard Integration**
- Progress banner on Borrower and Lender dashboards
- Shows completion percentage
- "Continue Setup" button to resume onboarding
- Only appears when profile is incomplete
- Non-intrusive (appears after 3-second delay)

## Technical Implementation

### Backend Components

#### Models (`onboarding/models.py`)
- `OnboardingProgress`: Tracks completion status and verification scores
- `OnboardingData`: Stores all collected user data
- `OnboardingSession`: Manages chatbot conversation sessions

#### Services (`onboarding/services.py`)
- `OnboardingChatbotService`: Manages conversation flow and questions
- `AddressVerificationService`: Integrates with Google Maps API
- Uses existing `HMRCVerificationService` for company verification

#### Views (`onboarding/views.py`)
- `OnboardingViewSet`: REST API endpoints for:
  - `/api/onboarding/progress/` - Get progress status
  - `/api/onboarding/chat/` - Chatbot conversation (GET/POST)
  - `/api/onboarding/save_data/` - Save collected data
  - `/api/onboarding/verify_address/` - Verify address
  - `/api/onboarding/verify_company/` - Verify company

#### Admin (`onboarding/admin.py`)
- Full admin interface for managing onboarding data
- View progress, sessions, and collected data
- Search and filter capabilities

### Frontend Components

#### Chatbot Component (`components/Chatbot.js`)
- Floating chatbot window
- Message history display
- Input handling for different question types:
  - Text input
  - Date input
  - Number input
  - Select/options
  - File upload (drag & drop)
- Progress bar
- Auto-scroll to latest message
- Close/resume functionality

#### Dashboard Integration (`pages/Dashboard.js`, `BorrowerDashboard.js`, `LenderDashboard.js`)
- Checks onboarding progress on load
- Shows progress banner if incomplete
- Integrates chatbot component
- "Continue Setup" button

## API Endpoints

### GET `/api/onboarding/progress/`
Returns current user's onboarding progress.

**Response:**
```json
{
  "is_complete": false,
  "completion_percentage": 45,
  "current_step": "address_collection",
  "profile_complete": true,
  "contact_complete": true,
  "address_complete": false,
  "company_complete": false,
  "financial_complete": false,
  "documents_complete": false,
  "company_verified": false,
  "address_verified": false,
  "verification_score": null
}
```

### GET `/api/onboarding/chat/`
Start or resume chatbot conversation.

**Query Parameters:**
- `session_id` (optional): Resume existing session

**Response:**
```json
{
  "session_id": "uuid",
  "question": {
    "question": "What's your first name?",
    "step": "profile_name",
    "field": "first_name",
    "type": "text",
    "required": true
  },
  "progress": {...},
  "conversation_history": [...]
}
```

### POST `/api/onboarding/chat/`
Send message to chatbot.

**Request:**
```json
{
  "message": "John",
  "step": "profile_name",
  "session_id": "uuid"
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "question": {...},
  "progress": {...},
  "conversation_history": [...]
}
```

### POST `/api/onboarding/verify_address/`
Verify address using Google Maps API.

**Request:**
```json
{
  "address_line_1": "123 Main Street",
  "postcode": "SW1A 1AA",
  "town": "London"
}
```

### POST `/api/onboarding/verify_company/`
Verify company using HMRC API.

**Request:**
```json
{
  "company_number": "12345678",
  "company_name": "Example Ltd"
}
```

## UK Compliance

The data collection follows UK financial services requirements:
- Company registration verification via Companies House
- Director verification
- Address verification
- Financial information collection
- Document requirements (proof of identity, proof of address)
- Data stored securely with proper validation

## Usage

1. **First Login**: User logs in and is automatically shown the chatbot if profile is incomplete
2. **Conversation**: Chatbot asks questions in a conversational manner
3. **Verification**: Company and address information is automatically verified via APIs
4. **File Upload**: Users can drag and drop required documents
5. **Progress Tracking**: Dashboard shows completion percentage
6. **Resume**: Users can exit and resume onboarding at any time
7. **Completion**: Once complete, chatbot no longer appears automatically

## Environment Variables Required

- `GOOGLE_API_KEY`: For address verification
- `HMRC_API_KEY`: For company verification

## Database Migrations

Run migrations to create the onboarding tables:
```bash
python manage.py migrate onboarding
```

## Next Steps

The system is fully functional. Users will be guided through profile completion on first login, and can resume at any time through the dashboard banner.
