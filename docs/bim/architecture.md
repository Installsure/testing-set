# BIM Service Architecture (MIT — self-updating BIM)

Modules (must exist):

1. Ingest – detect & receive BIM payloads (IFC/Revit exports)
2. Normalize – harmonize units, coordinate systems, IDs; maintain a canonical object store
3. Update – apply diffs to the object-based 3D model; preserve invariants; log provenance
4. Publish – export views (IFC, CityGML, lightweight web formats) + indices for search

Design notes:

- Object-based model with explicit semantic relationships; changes propagate programmatically.
- All module contracts documented; each change emits a provenance record and triggers validators.
