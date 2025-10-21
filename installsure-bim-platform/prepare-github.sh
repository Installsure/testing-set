#!/bin/bash

# InstallSure BIM Platform - GitHub Deployment Script
# This script prepares the project for GitHub deployment

echo "🚀 Preparing InstallSure BIM Platform for GitHub deployment..."

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Playwright
test-results/
playwright-report/
playwright/.cache/

# Temporary folders
tmp/
temp/
EOF

# Create GitHub Actions workflow
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run Playwright tests
      run: npx playwright test
    
    - name: Build application
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files
        path: out/
EOF

# Create package.json scripts
cat > package.json << 'EOF'
{
  "name": "installsure-bim-platform",
  "version": "3.0.0",
  "description": "InstallSure v3.0 - BIM Integration Platform",
  "scripts": {
    "dev": "next dev -p 5173",
    "build": "next build",
    "start": "next start -p 5173",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test",
    "test:ci": "playwright test --reporter=github",
    "export": "next export",
    "deploy": "npm run build && npm run export"
  },
  "dependencies": {
    "next": "^14.2.11",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.400.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.2.11",
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  },
  "keywords": [
    "bim",
    "construction",
    "plans",
    "pdf-viewer",
    "3d-viewer",
    "tagging",
    "mit",
    "harvard",
    "academic-standards"
  ],
  "author": "InstallSure Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/installsure-bim-platform.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/installsure-bim-platform/issues"
  },
  "homepage": "https://github.com/your-org/installsure-bim-platform#readme"
}
EOF

# Create deployment instructions
cat > DEPLOYMENT.md << 'EOF'
# Deployment Instructions

## GitHub Repository Setup

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: InstallSure BIM Platform v3.0"
   git branch -M main
   git remote add origin https://github.com/your-org/installsure-bim-platform.git
   git push -u origin main
   ```

2. **Enable GitHub Pages** (Optional)
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Access at: `https://your-org.github.io/installsure-bim-platform`

3. **Enable GitHub Actions**
   - CI/CD pipeline automatically runs on push/PR
   - Tests must pass before merge
   - Build artifacts uploaded automatically

## Local Development

```bash
# Clone repository
git clone https://github.com/your-org/installsure-bim-platform.git
cd installsure-bim-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts for configuration
```

### Netlify
```bash
# Build for production
npm run build
npm run export

# Upload 'out' folder to Netlify
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "start"]
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5173
NEXT_PUBLIC_APP_NAME=InstallSure BIM Platform
```

## Monitoring & Analytics

- **Performance**: Built-in Next.js analytics
- **Errors**: Consider Sentry integration
- **Usage**: Google Analytics or similar
- **Uptime**: GitHub Actions health checks

## Security Considerations

- Enable GitHub security alerts
- Use Dependabot for dependency updates
- Regular security audits
- HTTPS enforcement in production
EOF

echo "✅ GitHub deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create GitHub repository"
echo "2. Run: git init && git add . && git commit -m 'Initial commit'"
echo "3. Add remote: git remote add origin <your-repo-url>"
echo "4. Push: git push -u origin main"
echo ""
echo "🌐 Repository will be accessible at:"
echo "https://github.com/your-org/installsure-bim-platform"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
