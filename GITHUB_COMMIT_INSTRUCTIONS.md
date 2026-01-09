# GitHub Commit Instructions

## Current Status
Git is not available via command line. Since you mentioned GitHub is connected, here are your options:

## Option 1: Using GitHub Desktop (Recommended if installed)

If you have GitHub Desktop installed:

1. **Open GitHub Desktop**
2. **Add the repository** (if not already added):
   - File → Add Local Repository
   - Navigate to: `C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub`
   - Click "Add repository"

3. **Commit Changes**:
   - All changes will appear in the left panel
   - Enter commit message:
     ```
     feat: Add comprehensive application detail page with document sharing

     - Add clickable application rows in BorrowerApplications
     - Implement tabbed interface in ApplicationDetail (Overview, Messages, Documents, Progress)
     - Add ApplicationDocument model for shared document storage
     - Implement document upload/download API endpoints
     - Add drag & drop file upload functionality
     - Integrate messages and progress tracking in detail page
     - Enhance application information display
     - Add FCA self-certification system for Private Equity access
     - Add onboarding chatbot system with progress tracking
     ```
   - Click "Commit to main" (or your branch name)

4. **Push to GitHub**:
   - Click "Push origin" button
   - Changes will be pushed to: `BuildFund/main/buildfund_webapp`

## Option 2: Install Git for Command Line

1. **Install Git**:
   ```powershell
   winget install Git.Git
   ```
   Or download from: https://git-scm.com/download/win

2. **After installation, restart your terminal and run**:
   ```powershell
   cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub"
   .\commit_to_github.ps1
   ```

## Option 3: Manual Git Setup

If you prefer to set up manually:

```powershell
# Navigate to project directory
cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub"

# Initialize repository (if not already initialized)
git init

# Add remote (adjust URL if needed)
git remote add origin https://github.com/BuildFund/main.git

# Add all files
git add .

# Commit
git commit -m "feat: Add comprehensive application detail page with document sharing

- Add clickable application rows in BorrowerApplications
- Implement tabbed interface in ApplicationDetail (Overview, Messages, Documents, Progress)
- Add ApplicationDocument model for shared document storage
- Implement document upload/download API endpoints
- Add drag & drop file upload functionality
- Integrate messages and progress tracking in detail page
- Enhance application information display
- Add FCA self-certification system for Private Equity access
- Add onboarding chatbot system with progress tracking"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Recent Changes Summary

The following major features have been implemented:

### 1. Application Detail Enhancement
- Clickable application rows in BorrowerApplications
- Tabbed interface (Overview, Messages, Documents, Progress)
- Document sharing between borrower and lender
- Enhanced information display

### 2. FCA Self-Certification
- FCA certification model and API
- Self-certification page for Private Equity access
- Access control on PE dashboard

### 3. Onboarding Chatbot System
- Conversational onboarding chatbot
- Progress tracking
- HMRC and Google API integration for verification
- File upload support

### Files Modified/Created:
- `buildfund_webapp/applications/models.py` - Added ApplicationDocument model
- `buildfund_webapp/applications/views.py` - Added document endpoints
- `buildfund_webapp/private_equity/certification_models.py` - New FCA certification
- `buildfund_webapp/onboarding/` - New onboarding app
- `new_website/src/pages/ApplicationDetail.js` - Complete rewrite with tabs
- `new_website/src/pages/BorrowerApplications.js` - Added clickable rows
- `new_website/src/pages/FCACertification.js` - New certification page
- `new_website/src/components/Chatbot.js` - New chatbot component
- Multiple migration files

## Repository Information

- **Repository**: BuildFund/main/buildfund_webapp
- **Branch**: main (or master)
- **Location**: `C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub`

## Next Steps

1. Choose one of the options above
2. Commit your changes
3. Push to GitHub
4. Verify on GitHub that all changes are committed

If you need help with any step, let me know!
