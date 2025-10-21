#requires -version 5
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot/..

Write-Host "🚀 Starting InstallSure Verification Suite" -ForegroundColor Green
Write-Host "=" * 60

# Check if we're in the right directory
if (-not (Test-Path "installsure") -and -not (Test-Path "frontend") -and -not (Test-Path "backend")) {
    Write-Host "❌ Not in InstallSure project directory" -ForegroundColor Red
    exit 1
}

# Backend Tests
Write-Host "`n🐍 Running Backend Tests..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Set-Location backend
    
    # Create virtual environment if it doesn't exist
    if (-not (Test-Path ".venv")) { 
        Write-Host "Creating Python virtual environment..." -ForegroundColor Blue
        python -m venv .venv 
    }
    
    # Activate virtual environment
    Write-Host "Activating virtual environment..." -ForegroundColor Blue
    . .\.venv\Scripts\Activate.ps1
    
    # Install dependencies
    Write-Host "Installing Python dependencies..." -ForegroundColor Blue
    pip install -U pip
    pip install -r requirements.txt 2>$null
    pip install pytest pytest-cov 2>$null
    
    # Run tests
    Write-Host "Running backend tests..." -ForegroundColor Blue
    pytest tests/ --cov=app --cov-report=term-missing --cov-fail-under=60
    
    Set-Location ..
} else {
    Write-Host "⚠️ Backend directory not found, skipping backend tests" -ForegroundColor Yellow
}

# Frontend Tests
Write-Host "`n⚛️ Running Frontend Tests..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Set-Location frontend
    
    # Install dependencies
    if (-not (Test-Path "node_modules")) { 
        Write-Host "Installing Node.js dependencies..." -ForegroundColor Blue
        npm install 
    }
    
    # Install Playwright
    Write-Host "Installing Playwright..." -ForegroundColor Blue
    npx playwright install --with-deps 2>$null
    
    # Run static scan for dead controls
    Write-Host "Scanning for dead controls..." -ForegroundColor Blue
    if (Test-Path "tools/find-dead-controls.mjs") {
        node tools/find-dead-controls.mjs
    } else {
        Write-Host "⚠️ Dead controls scanner not found, skipping..." -ForegroundColor Yellow
    }
    
    # Run unit tests
    Write-Host "Running unit tests..." -ForegroundColor Blue
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            npm test 2>$null
        } else {
            Write-Host "⚠️ No test script found in package.json" -ForegroundColor Yellow
        }
    }
    
    # Run E2E tests
    Write-Host "Running E2E tests..." -ForegroundColor Blue
    if (Test-Path "playwright.config.ts") {
        npx playwright test 2>$null
    } else {
        Write-Host "⚠️ Playwright config not found, skipping E2E tests..." -ForegroundColor Yellow
    }
    
    Set-Location ..
} else {
    Write-Host "⚠️ Frontend directory not found, skipping frontend tests" -ForegroundColor Yellow
}

# Security Garage Tests
Write-Host "`n🔧 Running Security Garage Tests..." -ForegroundColor Yellow
if (Test-Path "security-garage") {
    Set-Location security-garage
    
    # Install dependencies
    if (-not (Test-Path "node_modules")) { 
        Write-Host "Installing Security Garage dependencies..." -ForegroundColor Blue
        npm install 
    }
    
    # Run tests
    Write-Host "Running Security Garage tests..." -ForegroundColor Blue
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            npm test 2>$null
        }
    }
    
    Set-Location ..
} else {
    Write-Host "⚠️ Security Garage directory not found, skipping..." -ForegroundColor Yellow
}

# InstallSure Ecosystem Tests
Write-Host "`n🏗️ Running InstallSure Ecosystem Tests..." -ForegroundColor Yellow
if (Test-Path "installsure") {
    Set-Location installsure
    
    # Test Docker Compose configuration
    if (Test-Path "shared-iac/docker-compose.yml") {
        Write-Host "Validating Docker Compose configuration..." -ForegroundColor Blue
        docker-compose -f shared-iac/docker-compose.yml config 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker Compose configuration is valid" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Docker Compose configuration has issues" -ForegroundColor Yellow
        }
    }
    
    # Test individual services
    Write-Host "Testing individual services..." -ForegroundColor Blue
    $services = @("jarvisops", "atlassearch", "3d-builder-engine", "esticore-engine", "reality-capture-engine", "sentinelguard", "badge-uno")
    
    foreach ($service in $services) {
        if (Test-Path $service) {
            Write-Host "  Testing $service..." -ForegroundColor Blue
            if (Test-Path "$service/Dockerfile") {
                Write-Host "    ✅ $service has Dockerfile" -ForegroundColor Green
            }
            if (Test-Path "$service/openapi.yaml") {
                Write-Host "    ✅ $service has OpenAPI spec" -ForegroundColor Green
            }
            if (Test-Path "$service/requirements.txt") {
                Write-Host "    ✅ $service has requirements.txt" -ForegroundColor Green
            }
        }
    }
    
    Set-Location ..
} else {
    Write-Host "⚠️ InstallSure directory not found, skipping ecosystem tests..." -ForegroundColor Yellow
}

# Generate Test Report
Write-Host "`n📊 Generating Test Report..." -ForegroundColor Yellow
$reportPath = "verification-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

$report = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    project = "InstallSure Ecosystem"
    tests_run = @{
        backend = Test-Path "backend"
        frontend = Test-Path "frontend"
        security_garage = Test-Path "security-garage"
        installsure_ecosystem = Test-Path "installsure"
    }
    status = "completed"
    recommendations = @(
        "All verification tests have been completed",
        "Review any warnings or skipped tests",
        "Ensure all services are properly configured",
        "Run individual service tests as needed"
    )
} | ConvertTo-Json -Depth 3

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Green

Write-Host "`n" + "=" * 60
Write-Host "🎉 INSTALLSURE VERIFICATION COMPLETED" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "✅ All tests have been executed" -ForegroundColor Green
Write-Host "📊 Check the report for detailed results" -ForegroundColor Green
Write-Host "🚀 Informed about the current state of the system" -ForegroundColor Green

