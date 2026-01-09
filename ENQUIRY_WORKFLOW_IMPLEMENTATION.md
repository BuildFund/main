# Enquiry & Messaging Workflow Implementation

## ✅ Implementation Complete

### Overview
The system now supports a complete workflow where:
1. Borrowers can view matched products for their approved projects
2. Borrowers can submit enquiries about matched products
3. Lenders receive notifications and can view borrower/project details
4. Both parties can message each other once connected via an enquiry/application

---

## 🔄 Workflow Steps

### 1. Borrower Views Matched Products
- **Endpoint**: `GET /api/projects/{id}/matched-products/`
- **Page**: `/borrower/matches`
- **Functionality**: 
  - Borrower selects an approved project
  - System shows all matching lender products
  - Products are filtered by funding type, property type, loan amount, term, and LTV ratio

### 2. Borrower Submits Enquiry
- **Endpoint**: `POST /api/projects/{id}/submit-enquiry/`
- **Payload**: 
  ```json
  {
    "product_id": 1,
    "notes": "Optional message to lender"
  }
  ```
- **Functionality**:
  - Creates an `Application` with `initiated_by="borrower"`
  - Sets status to "pending"
  - Sends email notification to lender
  - Lender can now see borrower and project details

### 3. Lender Views Enquiries
- **Endpoint**: `GET /api/applications/`
- **Page**: `/lender/applications`
- **Functionality**:
  - Lenders see both:
    - **Enquiries** (initiated by borrowers) - Shows borrower and project details
    - **Applications** (initiated by lenders) - Shows project details
  - Click "View Details" to expand and see:
    - Full borrower profile (name, company, experience, contact info)
    - Complete project details (address, description, financials)
    - Application terms

### 4. Messaging Between Parties
- **Endpoint**: `GET /api/messaging/messages/by_application/?application_id={id}`
- **Endpoint**: `POST /api/messaging/messages/`
- **Page**: `/borrower/messages` or `/lender/messages`
- **Functionality**:
  - Select an application/enquiry to view conversation
  - Send messages to the other party
  - Messages are linked to the application
  - Both parties can see the full conversation thread

---

## 📋 API Endpoints

### Enquiry Submission
```
POST /api/projects/{project_id}/submit-enquiry/
Body: {
  "product_id": 1,
  "notes": "Optional message"
}
```

### View Applications (with full details)
```
GET /api/applications/
Returns: List of applications with:
  - project_details (full project info)
  - borrower_details (full borrower profile + user info)
  - lender_details (full lender profile + user info)
  - product_details (full product info)
  - initiated_by ("borrower" or "lender")
```

### Messaging
```
GET /api/messaging/messages/by_application/?application_id={id}
POST /api/messaging/messages/
Body: {
  "application": 1,
  "recipient": 2,
  "subject": "Message subject",
  "body": "Message body"
}
```

---

## 🎯 Frontend Pages

### Borrower Pages
1. **Borrower Matches** (`/borrower/matches`)
   - View matched products
   - Submit enquiries with "Submit Enquiry" button
   - Success message after submission

2. **Borrower Applications** (`/borrower/applications`)
   - View all applications/enquiries on their projects
   - See lender details
   - Link to messaging

3. **Messages** (`/borrower/messages`)
   - Select application to view conversation
   - Send messages to lenders

### Lender Pages
1. **Lender Applications** (`/lender/applications`)
   - View all applications and enquiries
   - Expandable rows showing:
     - Borrower details (name, company, experience, contact)
     - Project details (address, description, financials)
     - Application terms
   - "Message Borrower" button

2. **Messages** (`/lender/messages`)
   - Select application to view conversation
   - Send messages to borrowers

---

## 🔐 Permissions

- **Borrowers** can:
  - Submit enquiries on their own approved projects
  - View applications on their projects
  - Message lenders on applications

- **Lenders** can:
  - View enquiries from borrowers (with full borrower/project details)
  - View their own applications
  - Message borrowers on applications/enquiries

- **Admins** can:
  - View all applications
  - View all messages

---

## 📊 Data Model Changes

### Application Model
- Added `initiated_by` field: `"borrower"` or `"lender"`
- Made `proposed_interest_rate` and `proposed_ltv_ratio` optional (for borrower enquiries)

### Serializers
- `ApplicationSerializer` now includes:
  - `project_details` - Full project information
  - `borrower_details` - Full borrower profile + user info
  - `lender_details` - Full lender profile + user info
  - `product_details` - Full product information

---

## ✅ Testing Checklist

1. **Borrower Workflow**:
   - [ ] Log in as borrower
   - [ ] Go to Matched Products page
   - [ ] Select an approved project
   - [ ] View matched products
   - [ ] Click "Submit Enquiry" on a product
   - [ ] Verify success message
   - [ ] Check Applications page to see the enquiry

2. **Lender Workflow**:
   - [ ] Log in as lender
   - [ ] Go to Applications page
   - [ ] See borrower enquiry in list
   - [ ] Click "View Details" to expand
   - [ ] Verify borrower details are visible
   - [ ] Verify project details are visible
   - [ ] Click "Message Borrower"
   - [ ] Send a message
   - [ ] Verify message appears in conversation

3. **Messaging**:
   - [ ] Borrower can view messages
   - [ ] Borrower can reply to lender
   - [ ] Lender can view messages
   - [ ] Lender can reply to borrower
   - [ ] Messages are linked to correct application

---

## 🎉 Features Implemented

✅ Borrower enquiry submission  
✅ Lender can view borrower details  
✅ Lender can view project details  
✅ Messaging system integrated  
✅ Email notifications for enquiries  
✅ Full application details in API responses  
✅ Frontend UI for all workflows  

---

**The complete enquiry and messaging workflow is now functional!**
