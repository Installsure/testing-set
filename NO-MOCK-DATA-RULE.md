# NO MOCK DATA RULE

## CRITICAL RULE FOR ALL PROJECTS

**NEVER use mock data, placeholders, or fake examples in any project for this user.**

### What this means:
- No mock data arrays
- No placeholder components that don't actually work
- No fake "Plan Preview" boxes
- No simulated functionality
- No "TODO" comments in place of real code

### What to do instead:
- Implement actual working PDF viewers that display real PDFs
- Use real construction plan data
- Create functional components that actually work
- Provide real file upload and viewing capabilities
- Test with actual construction documents

### Examples of what NOT to do:
```jsx
// ❌ WRONG - Mock data
const plans = [
  { id: 1, name: "Mock Plan", type: "ARCHITECTURAL" }
];

// ❌ WRONG - Placeholder component
<div className="plan-preview-placeholder">
  <span>Plan Preview</span>
</div>
```

### Examples of what TO do:
```jsx
// ✅ CORRECT - Real data from actual files
const plans = await loadActualPlanFiles();

// ✅ CORRECT - Real working component
<PDFViewer file={actualPlanFile} />
```

This rule is NON-NEGOTIABLE and applies to ALL implementations.
