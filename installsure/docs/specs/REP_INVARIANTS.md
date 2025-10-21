# Representation Invariants & Abstraction Functions (MIT 6.102/6.005)

## JarvisOps Service

### Job Management Module

**AF:** `JOBS: dict[str, JobState]` ↦ abstract job execution system  
**RI:**

- All job IDs are valid UUIDs (non-empty, format-valid)
- Job states are in {PLANNED, RUNNING, COMPLETED, FAILED}
- Completed jobs have non-null result data
- Running jobs have valid start timestamps
- No job can transition from COMPLETED back to RUNNING

**No Rep Exposure:**

- Job internal state is immutable after completion
- External access only through controlled getter methods
- Job IDs are opaque tokens, not sequential integers

### Memory Management Module

**AF:** `MEMORY: dict[str, list[MemoryEntry]]` ↦ abstract knowledge storage system  
**RI:**

- All scope names are non-empty strings
- Memory entries are immutable once stored
- Global scope always exists and is accessible
- Memory entries have valid timestamps and content
- No circular references in memory structure

**No Rep Exposure:**

- Memory entries are deep-copied on retrieval
- No direct access to internal memory structure
- Scope isolation prevents cross-contamination

## SentinelGuard Service

### Security Scan Module

**AF:** `SCAN_RESULTS: dict[str, ScanReport]` ↦ abstract vulnerability assessment system  
**RI:**

- All scan IDs are valid UUIDs
- Scan reports contain valid finding classifications
- Critical findings are prioritized over low-severity ones
- Scan timestamps are monotonically increasing
- No scan can be modified after completion

**No Rep Exposure:**

- Scan results are immutable after generation
- External access only through sanitized reports
- Sensitive paths are masked in public reports

### Quarantine Management Module

**AF:** `QUARANTINE: set[str]` ↦ abstract artifact isolation system  
**RI:**

- All quarantined artifact IDs are valid
- Quarantined artifacts cannot be accessed directly
- Quarantine state is persistent across service restarts
- No artifact can be in quarantine and active simultaneously

**No Rep Exposure:**

- Quarantine status is boolean only
- No access to quarantined artifact contents
- Quarantine operations are atomic

## 3D Builder Engine

### Project Management Module

**AF:** `PROJECTS: dict[str, Project]` ↦ abstract 3D construction workspace  
**RI:**

- All project IDs are valid UUIDs
- Projects have spawn states in {DRAFT, ACTIVE, COMPLETED, ARCHIVED}
- Active projects have valid blueprint references
- Completed projects have non-null artifact URLs
- Project names are unique within workspace

**No Rep Exposure:**

- Project internal state is immutable after completion
- Blueprint data is accessed through controlled interfaces
- Artifact URLs are signed and time-limited

### Model Generation Module

**AF:** `BUILD_JOBS: dict[str, BuildJob]` ↦ abstract 3D model construction pipeline  
**RI:**

- Build job states are in {QUEUED, PROCESSING, COMPLETED, FAILED}
- Processing jobs have valid input references
- Completed jobs have valid output artifacts
- Failed jobs have error codes and messages
- No job can exceed maximum processing time

**No Rep Exposure:**

- Build inputs are validated before processing
- Output artifacts are immutable after generation
- Job status transitions are atomic

## EstiCore Engine

### Cost Estimation Module

**AF:** `ESTIMATES: dict[str, CostEstimate]` ↦ abstract quantity takeoff system  
**RI:**

- All estimate IDs are valid UUIDs
- Estimates contain valid material quantities
- Cost calculations are mathematically consistent
- Estimates have valid currency and unit specifications
- No estimate can be negative or zero

**No Rep Exposure:**

- Estimation formulas are immutable
- Cost breakdowns are sanitized for external display
- Internal calculation details are protected

## Reality Capture Engine

### Scan Processing Module

**AF:** `SCAN_JOBS: dict[str, ScanJob]` ↦ abstract 3D reconstruction pipeline  
**RI:**

- Scan job states are in {UPLOADED, PROCESSING, COMPLETED, FAILED}
- Processing jobs have valid input file references
- Completed jobs have valid point cloud data
- Failed jobs have specific error classifications
- No job can process invalid file formats

**No Rep Exposure:**

- Input files are validated before processing
- Point cloud data is compressed and encrypted
- Processing status is atomic

## AtlasSearch Service

### Research Management Module

**AF:** `RESEARCH: dict[str, ResearchTask]` ↦ abstract knowledge discovery system  
**RI:**

- All research IDs are valid UUIDs
- Research states are in {PENDING, ACTIVE, COMPLETED, FAILED}
- Completed research has valid citations and briefs
- Active research has valid query parameters
- No research can be modified after completion

**No Rep Exposure:**

- Research queries are sanitized
- Citation data is validated and filtered
- Brief content is formatted consistently

## Badge+UNO Service

### UIR Generation Module

**AF:** `UIR_CACHE: dict[str, UIRDocument]` ↦ abstract universal intermediate representation  
**RI:**

- All UIR documents have valid schema compliance
- UIR nodes have proper type annotations
- UIR effects are classified as {pure, impure, side_effect}
- No circular dependencies in UIR graphs
- All UIR documents are valid JSON

**No Rep Exposure:**

- UIR documents are immutable after generation
- Schema validation is enforced
- Type information is preserved
