# InstallSure v3.0 - BIM Integration Platform

## Overview

InstallSure is a comprehensive BIM (Building Information Modeling) integration platform designed for construction management. This application provides real-time plan viewing, 3D model visualization, and tagging systems for construction projects.

## Features

### 🏗️ Construction Plan Management

- **Real PDF Viewer** - View construction plans with zoom, pan, and navigation
- **3D BIM Viewer** - Interactive 3D model visualization with element selection
- **Tag System** - Add annotations and tags directly on plans
- **Multi-format Support** - PDF, IFC, and other construction document formats

### 🔧 Technical Features

- **Next.js 14** - Modern React framework
- **PDF.js Integration** - Real PDF rendering (no mock data)
- **Three.js 3D Engine** - Interactive 3D visualization
- **MIT/Harvard Standards** - Academic compliance and formal verification
- **Security First** - Built-in security testing and compliance

### 📋 Project Management

- **Plan Versioning** - Track plan revisions and changes
- **Status Tracking** - Current, Under Review, Approved statuses
- **Category Filtering** - Architectural, Structural, MEP, Site plans
- **Search Functionality** - Quick plan discovery

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/installsure-bim-platform.git
cd installsure-bim-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Application

Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── app/
│   ├── page.jsx          # Main construction plans page
│   ├── layout.jsx        # Root layout with providers
│   └── globals.css       # Global styles
├── components/
│   ├── PDFViewer.jsx     # PDF plan viewer
│   ├── IFCViewer.jsx     # 3D BIM model viewer
│   ├── RealPDFViewer.jsx # Enhanced PDF viewer
│   └── RealIFCViewer.jsx # Enhanced 3D viewer
public/
├── shared/lib/
│   └── universal-plan-viewer.js  # Universal viewer library
└── plan-viewer-fix.js    # Button patching script
```

## Key Components

### Real PDF Viewer

- **PDF.js Integration** - Actual PDF rendering
- **Interactive Controls** - Zoom, pan, page navigation
- **Tag Overlays** - Click to add annotations
- **Real File Support** - Upload and view actual construction plans

### 3D BIM Viewer

- **Three.js Engine** - Real 3D visualization
- **Element Selection** - Click to select building elements
- **Orbit Controls** - Rotate, zoom, pan in 3D
- **Building Structure** - Simulated construction elements

### Tag System

- **Click to Tag** - Add tags by clicking on plans
- **Persistent Storage** - Tags saved and displayed
- **Edit/Delete** - Manage existing tags
- **Visual Indicators** - Clear tag display

## Development Standards

### No Mock Data Policy

This application follows a strict "No Mock Data" policy:

- ✅ Real PDF rendering with PDF.js
- ✅ Real 3D visualization with Three.js
- ✅ Real file upload and processing
- ✅ Real construction plan data structures
- ❌ No placeholder components
- ❌ No simulated functionality
- ❌ No mock data arrays

### MIT/Harvard Compliance

- **Representation Invariants** - Formal specification of data structures
- **Alloy Models** - Formal verification of system properties
- **Translation Validation** - Equivalence testing for refactors
- **Security Analysis** - Threat modeling and security properties

## Testing

### Playwright E2E Tests

```bash
# Run end-to-end tests
npx playwright test
```

### Test Coverage

- PDF viewer functionality
- 3D model loading
- Tag system operations
- Plan navigation and controls

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=your_api_url
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the "No Mock Data" policy
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

1. Check the GitHub Issues page
2. Review the documentation
3. Submit detailed bug reports with reproduction steps

---

**InstallSure v3.0** - Professional BIM Integration Platform for Construction Management
