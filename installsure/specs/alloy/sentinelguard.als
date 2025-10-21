module sentinelguard
open util/boolean
open util/time

-- Core abstractions
sig UUID { }
sig ScanID extends UUID { }
sig ArtifactID extends UUID { }

-- Security findings per Harvard security analysis standards
abstract sig FindingType { }
one sig CRITICAL, HIGH, MEDIUM, LOW, INFO extends FindingType { }

abstract sig FindingCategory { }
one sig SECRET, VULNERABILITY, MALWARE, COMPLIANCE extends FindingCategory { }

-- Security scan results
sig Finding {
    type: one FindingType,
    category: one FindingCategory,
    path: one String,
    line: one Int,
    message: one String,
    scan_id: one ScanID
}

sig ScanReport {
    id: one ScanID,
    findings: set Finding,
    timestamp: one Time,
    status: one ScanStatus
}

abstract sig ScanStatus { }
one sig PENDING, RUNNING, COMPLETED, FAILED extends ScanStatus { }

-- Quarantine management
sig QuarantinedArtifact {
    id: one ArtifactID,
    quarantine_time: one Time,
    reason: one String
}

-- Invariants per MIT representation invariants
pred ScanInvariants {
    -- All scan IDs are unique
    all s1, s2: ScanReport | s1 != s2 implies s1.id != s2.id
    
    -- Scan status transitions
    all s: ScanReport | {
        s.status = PENDING implies no s.findings
        s.status = RUNNING implies no s.findings
        s.status = COMPLETED implies some s.findings
        s.status = FAILED implies no s.findings
    }
    
    -- Findings belong to valid scans
    all f: Finding | some s: ScanReport | f in s.findings and f.scan_id = s.id
    
    -- Critical findings are prioritized
    all f: Finding | f.type = CRITICAL implies f.category in SECRET + VULNERABILITY
}

pred QuarantineInvariants {
    -- All quarantined artifacts have unique IDs
    all q1, q2: QuarantinedArtifact | q1 != q2 implies q1.id != q2.id
    
    -- Quarantine reasons are non-empty
    all q: QuarantinedArtifact | q.reason != ""
    
    -- Quarantine timestamps are valid
    all q: QuarantinedArtifact | q.quarantine_time >= Time.min
}

pred SecurityInvariants {
    -- No artifact can be both quarantined and active
    -- (This would require an "active artifacts" set, simplified here)
    
    -- All findings have valid line numbers
    all f: Finding | f.line > 0
    
    -- All findings have non-empty messages
    all f: Finding | f.message != ""
}

-- Global system invariants
pred SystemInvariants {
    ScanInvariants
    QuarantineInvariants
    SecurityInvariants
}

-- Check invariants
run SystemInvariants for 10

-- Property: Critical findings are always reported
assert CriticalFindingsReported {
    all f: Finding | f.type = CRITICAL implies some s: ScanReport | f in s.findings
}

check CriticalFindingsReported for 10

-- Property: No duplicate quarantine entries
assert NoDuplicateQuarantine {
    all q1, q2: QuarantinedArtifact | q1 != q2 implies q1.id != q2.id
}

check NoDuplicateQuarantine for 10
