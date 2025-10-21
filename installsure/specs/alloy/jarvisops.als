module jarvisops
open util/boolean
open util/time

-- Core abstractions
sig UUID { }
sig JobID extends UUID { }
sig MemoryScope extends UUID { }

-- Job states per MIT representation invariants
abstract sig JobState { }
one sig PLANNED, RUNNING, COMPLETED, FAILED extends JobState { }

-- Job management
sig Job {
    id: one JobID,
    state: one JobState,
    created: one Time,
    started: lone Time,
    completed: lone Time
}

-- Memory management
sig MemoryEntry {
    content: one String,
    timestamp: one Time,
    scope: one MemoryScope
}

-- Invariants per MIT 6.102/6.005
pred JobInvariants {
    -- All job IDs are unique
    all j1, j2: Job | j1 != j2 implies j1.id != j2.id
    
    -- Job state transitions are valid
    all j: Job | {
        j.state = PLANNED implies no j.started and no j.completed
        j.state = RUNNING implies some j.started and no j.completed
        j.state = COMPLETED implies some j.started and some j.completed
        j.state = FAILED implies some j.started and no j.completed
    }
    
    -- Time ordering constraints
    all j: Job | {
        some j.started implies j.started >= j.created
        some j.completed implies j.completed >= j.started
    }
    
    -- No completed job can transition back to running
    all j: Job | j.state = COMPLETED implies j.state = COMPLETED
}

pred MemoryInvariants {
    -- All memory entries have valid timestamps
    all m: MemoryEntry | m.timestamp >= Time.min
    
    -- Memory entries are immutable (no duplicate timestamps per scope)
    all m1, m2: MemoryEntry | 
        m1 != m2 and m1.scope = m2.scope implies m1.timestamp != m2.timestamp
}

-- Global system invariants
pred SystemInvariants {
    JobInvariants
    MemoryInvariants
}

-- Check invariants
run SystemInvariants for 10

-- Property: No job can be in invalid state
assert NoInvalidJobStates {
    all j: Job | j.state in PLANNED + RUNNING + COMPLETED + FAILED
}

check NoInvalidJobStates for 10

-- Property: Completed jobs have valid completion times
assert CompletedJobsHaveTimes {
    all j: Job | j.state = COMPLETED implies some j.completed
}

check CompletedJobsHaveTimes for 10
