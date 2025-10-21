module 3dbuilder
open util/boolean
open util/time

-- Core abstractions
sig UUID { }
sig ProjectID extends UUID { }
sig JobID extends UUID { }

-- Project states per MIT representation invariants
abstract sig ProjectState { }
one sig DRAFT, ACTIVE, COMPLETED, ARCHIVED extends ProjectState { }

-- Build job states
abstract sig BuildState { }
one sig QUEUED, PROCESSING, COMPLETED, FAILED extends BuildState { }

-- Projects and artifacts
sig Project {
    id: one ProjectID,
    name: one String,
    state: one ProjectState,
    created: one Time,
    blueprint_ref: lone String
}

sig BuildJob {
    id: one JobID,
    project: one Project,
    state: one BuildState,
    created: one Time,
    started: lone Time,
    completed: lone Time,
    input_ref: lone String,
    output_artifacts: lone ArtifactSet
}

sig ArtifactSet {
    ifc_url: lone String,
    glb_url: lone String,
    tileset_url: lone String,
    report_url: lone String
}

-- Invariants per MIT representation invariants
pred ProjectInvariants {
    -- All project IDs are unique
    all p1, p2: Project | p1 != p2 implies p1.id != p2.id
    
    -- Project state constraints
    all p: Project | {
        p.state = DRAFT implies no p.blueprint_ref
        p.state = ACTIVE implies some p.blueprint_ref
        p.state = COMPLETED implies some p.blueprint_ref
        p.state = ARCHIVED implies some p.blueprint_ref
    }
    
    -- Project names are unique
    all p1, p2: Project | p1 != p2 implies p1.name != p2.name
}

pred BuildJobInvariants {
    -- All job IDs are unique
    all j1, j2: BuildJob | j1 != j2 implies j1.id != j2.id
    
    -- Job state transitions
    all j: BuildJob | {
        j.state = QUEUED implies no j.started and no j.completed
        j.state = PROCESSING implies some j.started and no j.completed
        j.state = COMPLETED implies some j.started and some j.completed and some j.output_artifacts
        j.state = FAILED implies some j.started and no j.completed
    }
    
    -- Time ordering constraints
    all j: BuildJob | {
        some j.started implies j.started >= j.created
        some j.completed implies j.completed >= j.started
    }
    
    -- Input references for processing jobs
    all j: BuildJob | j.state = PROCESSING implies some j.input_ref
}

pred ArtifactInvariants {
    -- Completed jobs have valid artifacts
    all j: BuildJob | j.state = COMPLETED implies some j.output_artifacts
    
    -- Artifact URLs are valid (non-empty)
    all a: ArtifactSet | {
        some a.ifc_url implies a.ifc_url != ""
        some a.glb_url implies a.glb_url != ""
        some a.tileset_url implies a.tileset_url != ""
        some a.report_url implies a.report_url != ""
    }
}

-- Global system invariants
pred SystemInvariants {
    ProjectInvariants
    BuildJobInvariants
    ArtifactInvariants
}

-- Check invariants
run SystemInvariants for 10

-- Property: No project in invalid state
assert NoInvalidProjectStates {
    all p: Project | p.state in DRAFT + ACTIVE + COMPLETED + ARCHIVED
}

check NoInvalidProjectStates for 10

-- Property: Completed build jobs have artifacts
assert CompletedJobsHaveArtifacts {
    all j: BuildJob | j.state = COMPLETED implies some j.output_artifacts
}

check CompletedJobsHaveArtifacts for 10

-- Property: Active projects have blueprints
assert ActiveProjectsHaveBlueprints {
    all p: Project | p.state = ACTIVE implies some p.blueprint_ref
}

check ActiveProjectsHaveBlueprints for 10
