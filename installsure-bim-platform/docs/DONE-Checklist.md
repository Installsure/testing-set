# DEFINITION OF DONE – InstallSure (Plans & BIM Viewer)

## Viewer Requirements
- [ ] Opening a PDF shows page 1 rendered into `#pdfCanvas` (verify non-white pixel presence in CI)
- [ ] Tag overlay (`#tagLayer`) appears, persists tags in DB, and reloads them correctly
- [ ] Opening an IFC loads a 3D model; selecting an element returns an element ID; double-click logs/opens details
- [ ] 2D/3D pan/zoom work smoothly (target ~60 fps) on a mid-tier laptop

## Files & Document Control
- [ ] File naming enforced: `<Project>-<Discipline>-<Sheet>-v<semver>.pdf|ifc`
- [ ] Role-based permissions: users only open/download allowed documents
- [ ] Version history logged: who opened, annotated, modified
- [ ] Document control performs QC: checklist built into DoD

## Quality & Testing
- [ ] Unit tests cover viewer adaptor code (target ≥ 70% coverage)
- [ ] Playwright e2e tests: "Open Plan", "Add Tag", "Open IFC", "Select Element" must pass
- [ ] Bug Bash completed (time-boxed session) with zero P0/P1 defects
- [ ] ISO/IEEE 29119 style test report attached to release

## Process & Engineering Best Practices
- [ ] Pull Requests are ≤ 400 lines; 1-2 reviewers per PR; apply Google Code Review rubric
- [ ] Change sets are small, incremental
- [ ] Automation: CI runs unit tests, e2e tests; code coverage, linting enforced
- [ ] Pre-release staging build is tested by QA & non-dev reviewers
- [ ] Formal "green gate" sign-off: engineering lead + QA + product owner confirm DoD checklist

## Bug-Bash Flow
- [ ] Schedule a 90-minute session with developers + QA + perhaps power users
- [ ] Use shared board to log defects; categorize P0/P1; resolve or defer with rationale
- [ ] At end of session: all P0/P1 must be closed before merge to release branch
