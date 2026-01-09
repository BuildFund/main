# PowerShell script to commit and push to GitHub
# This script will find git and commit all changes

Write-Host "Searching for Git installation..." -ForegroundColor Yellow

# Try to find git in common locations
$gitPath = $null
$possiblePaths = @(
    "git",
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\GitHubDesktop\resources\app\git\cmd\git.exe",
    "$env:ProgramFiles\Git\cmd\git.exe",
    "$env:ProgramFiles\Git\bin\git.exe"
)

foreach ($path in $possiblePaths) {
    try {
        if ($path -eq "git") {
            $result = & $path --version 2>&1
        } else {
            if (Test-Path $path) {
                $result = & $path --version 2>&1
            } else {
                continue
            }
        }
        if ($LASTEXITCODE -eq 0 -or $result -match "git version") {
            $gitPath = $path
            Write-Host "Found Git at: $path" -ForegroundColor Green
            break
        }
    } catch {
        continue
    }
}

if (-not $gitPath) {
    Write-Host "ERROR: Git not found. Please install Git from https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "Or use GitHub Desktop to commit and push your changes." -ForegroundColor Yellow
    exit 1
}

# Change to project directory
$projectDir = "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub"
Set-Location $projectDir

Write-Host "`nCurrent directory: $projectDir" -ForegroundColor Cyan

# Check if this is a git repository
if (-not (Test-Path .git)) {
    Write-Host "`nInitializing Git repository..." -ForegroundColor Yellow
    if ($gitPath -eq "git") {
        & git init
    } else {
        & $gitPath init
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
}

# Check remote
Write-Host "`nChecking remote configuration..." -ForegroundColor Yellow
if ($gitPath -eq "git") {
    $remote = & git remote get-url origin 2>&1
} else {
    $remote = & $gitPath remote get-url origin 2>&1
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "No remote configured. Setting up remote..." -ForegroundColor Yellow
    $repoUrl = "https://github.com/BuildFund/main.git"
    Write-Host "Setting remote to: $repoUrl" -ForegroundColor Cyan
    if ($gitPath -eq "git") {
        & git remote add origin $repoUrl 2>&1
    } else {
        & $gitPath remote add origin $repoUrl 2>&1
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Note: Remote may already exist or URL may need adjustment" -ForegroundColor Yellow
    }
}

# Add all files
Write-Host "`nAdding files to staging..." -ForegroundColor Yellow
if ($gitPath -eq "git") {
    & git add .
} else {
    & $gitPath add .
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to add files" -ForegroundColor Red
    exit 1
}

# Check if there are changes to commit
if ($gitPath -eq "git") {
    $status = & git status --porcelain
} else {
    $status = & $gitPath status --porcelain
}

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "`nNo changes to commit" -ForegroundColor Yellow
    exit 0
}

# Commit
Write-Host "`nCreating commit..." -ForegroundColor Yellow
$commitMessage = @"
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
"@

if ($gitPath -eq "git") {
    & git commit -m $commitMessage
} else {
    & $gitPath commit -m $commitMessage
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create commit" -ForegroundColor Red
    exit 1
}

Write-Host "`nCommit created successfully!" -ForegroundColor Green

# Push to GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
if ($gitPath -eq "git") {
    $currentBranch = & git branch --show-current 2>&1
    if (-not $currentBranch) {
        & git branch -M main
        $currentBranch = "main"
    }
    & git push -u origin $currentBranch
} else {
    $currentBranch = & $gitPath branch --show-current 2>&1
    if (-not $currentBranch) {
        & $gitPath branch -M main
        $currentBranch = "main"
    }
    & $gitPath push -u origin $currentBranch
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`nPush may have failed. You may need to:" -ForegroundColor Yellow
    Write-Host "1. Set up authentication (SSH key or personal access token)" -ForegroundColor Cyan
    Write-Host "2. Verify the repository URL is correct" -ForegroundColor Cyan
    Write-Host "3. Use GitHub Desktop if you have it installed" -ForegroundColor Cyan
}

Write-Host "`nDone!" -ForegroundColor Green
