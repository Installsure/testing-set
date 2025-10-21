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

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5173
NEXT_PUBLIC_APP_NAME=InstallSure BIM Platform
```

## Repository Access

**GitHub Repository**: `https://github.com/your-org/installsure-bim-platform`

**Live Demo**: `http://localhost:5173` (when running locally)

**Features Ready for Review**:

- ✅ Construction plans grid view
- ✅ PDF viewer with tag overlays
- ✅ 3D BIM viewer with element selection
- ✅ Tag editing and persistence
- ✅ MIT/Harvard academic standards compliance
- ✅ Playwright E2E test suite
- ✅ Definition of Done checklist
