# 🚀 Smart Life OS - CI/CD Workflow Runner (Windows)
# Script giúp chạy workflows một cách dễ dàng (PowerShell version)

# Check GitHub CLI
function Check-GH-CLI {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "❌ GitHub CLI not installed!" -ForegroundColor Red
        Write-Host "Install from: https://cli.github.com"
        exit 1
    }
    Write-Host "✅ GitHub CLI found" -ForegroundColor Green
}

function Print-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║ $Title" -ForegroundColor Blue
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Run-Frontend-Workflow {
    Print-Header "Running Frontend Workflow"
    Write-Host "Branch: main"
    Write-Host ""
    
    gh workflow run frontend.yml --ref main
    Print-Success "Frontend workflow triggered!"
    Write-Host ""
    Write-Host "Monitoring workflow..."
    gh run watch
}

function Run-Backend-Workflow {
    Print-Header "Running Backend Workflow"
    Write-Host "Branch: main"
    Write-Host ""
    
    gh workflow run backend.yml --ref main
    Print-Success "Backend workflow triggered!"
    Write-Host ""
    Write-Host "Monitoring workflow..."
    gh run watch
}

function Run-Docker-Workflow {
    Print-Header "Running Docker Workflow"
    Write-Host "Branch: main"
    Write-Host ""
    
    gh workflow run docker.yml
    Print-Success "Docker workflow triggered!"
    Write-Host ""
    Write-Host "Monitoring workflow..."
    gh run watch
}

function Run-All-Workflows {
    Print-Header "Running ALL Workflows"
    
    Write-Host "This will run all workflows sequentially..." -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "Continue? (y/n)"
    if ($continue -ne "y") {
        Print-Warning "Cancelled"
        return
    }
    
    Print-Header "1️⃣  Frontend Workflow"
    gh workflow run frontend.yml --ref main
    Print-Success "Frontend triggered"
    Start-Sleep -Seconds 5
    
    Print-Header "2️⃣  Backend Workflow"
    gh workflow run backend.yml --ref main
    Print-Success "Backend triggered"
    Start-Sleep -Seconds 5
    
    Print-Header "3️⃣  Docker Workflow"
    gh workflow run docker.yml
    Print-Success "Docker triggered"
    
    Write-Host ""
    Print-Success "All workflows triggered!"
    Write-Host "Check: Repository → Actions"
}

function View-Workflow-Logs {
    Print-Header "View Workflow Logs"
    Write-Host ""
    gh run list
    Write-Host ""
    
    $runId = Read-Host "Enter Run ID to view logs"
    
    if ([string]::IsNullOrWhiteSpace($runId)) {
        Print-Error "No Run ID provided"
        return
    }
    
    gh run view $runId --log
}

function List-Workflows {
    Print-Header "Available Workflows"
    Write-Host ""
    gh workflow list
}

function Push-To-Main {
    Print-Header "Push to Main Branch"
    
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Print-Warning "No changes to commit"
        return
    }
    
    Write-Host "Current changes:"
    git status --short
    Write-Host ""
    
    $commitMsg = Read-Host "Commit message"
    
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        Print-Error "No commit message provided"
        return
    }
    
    git add .
    git commit -m $commitMsg
    git push origin main
    
    Print-Success "Pushed to main!"
    Write-Host "Frontend and Backend workflows will run automatically"
}

function Push-With-Tag {
    Print-Header "Push to Main with Version Tag"
    
    $tag = Read-Host "Enter version tag (e.g., v1.0.0)"
    
    if ([string]::IsNullOrWhiteSpace($tag)) {
        Print-Error "No tag provided"
        return
    }
    
    # Check if tag already exists
    $tagExists = git rev-parse $tag 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Error "Tag $tag already exists!"
        return
    }
    
    git add .
    $commitMsg = Read-Host "Commit message"
    git commit -m $commitMsg
    git tag $tag
    
    git push origin main
    git push origin $tag
    
    Print-Success "Pushed to main with tag $tag!"
    Write-Host "Docker workflow will run automatically"
}

function Show-Menu {
    Print-Header "Smart Life OS - CI/CD Workflow Runner"
    Write-Host "Choose an option:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1) Run Frontend Workflow"
    Write-Host "2) Run Backend Workflow"
    Write-Host "3) Run Docker Workflow"
    Write-Host "4) Run ALL Workflows"
    Write-Host "5) View Workflow Logs"
    Write-Host "6) List All Workflows"
    Write-Host "7) Push to Main (triggers workflows)"
    Write-Host "8) Push to Main with Version Tag"
    Write-Host "9) Exit"
    Write-Host ""
}

function Main {
    Check-GH-CLI
    
    do {
        Show-Menu
        $choice = Read-Host "Enter your choice (1-9)"
        
        switch ($choice) {
            "1" { Run-Frontend-Workflow }
            "2" { Run-Backend-Workflow }
            "3" { Run-Docker-Workflow }
            "4" { Run-All-Workflows }
            "5" { View-Workflow-Logs }
            "6" { List-Workflows }
            "7" { Push-To-Main }
            "8" { Push-With-Tag }
            "9" { 
                Print-Success "Goodbye!"
                exit
            }
            default { 
                Print-Error "Invalid choice"
            }
        }
        
        Write-Host ""
        $again = Read-Host "Run another command? (y/n)"
    } while ($again -eq "y")
    
    Print-Success "Goodbye!"
}

Main
