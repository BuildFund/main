# Git Setup Instructions

## Current Status
This directory is not currently a git repository. To commit to GitHub, you'll need to:

## Option 1: Initialize New Repository

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - Or use: `winget install Git.Git`

2. **Initialize Git Repository**:
   ```powershell
   cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub"
   git init
   ```

3. **Add All Files**:
   ```powershell
   git add .
   ```

4. **Create Initial Commit**:
   ```powershell
   git commit -m "Initial commit: BuildFund platform with comprehensive features

   - Sidebar navigation with collapsible menu
   - Application progress tracking with status management
   - Account management system (personal info, password, team members)
   - Clickable dashboard items with detail pages
   - Industry-standard UI/UX improvements
   - Security hardening (API keys, throttling, CORS, validation)
   - Messaging system
   - Project reference system
   - Email notifications
   - HMRC/Companies House API integration"
   ```

5. **Connect to GitHub Repository**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Option 2: If Repository Already Exists on GitHub

1. **Clone the existing repository** (if you have one):
   ```powershell
   cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev"
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

2. **Copy your files into the cloned directory**

3. **Add, commit, and push**:
   ```powershell
   git add .
   git commit -m "Update: Add comprehensive account management and UI improvements"
   git push
   ```

## Recommended Commit Message

For the current updates, use:

```
feat: Add comprehensive account management and UI improvements

- Add sidebar navigation with collapsible menu
- Implement application progress tracking with status management
- Add account settings page with personal info, password, and team management
- Make all dashboard items clickable with detail pages
- Add industry-standard UI/UX improvements
- Implement security hardening (API keys, throttling, CORS, validation)
- Add messaging system
- Add project reference system
- Add email notifications
- Integrate HMRC/Companies House API
```

## Notes

- A `.gitignore` file has been created to exclude unnecessary files
- Make sure to never commit sensitive information (API keys, passwords, etc.)
- Environment variables should be in `.env` file (already in .gitignore)
