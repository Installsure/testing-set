# Representation Invariants & Abstraction Functions (per MIT 6.102/6.005)

## How to document each module

- Abstraction Function (AF): how the concrete rep maps to the abstract value.
- Rep Invariant (RI): properties that must hold after every public op.
- No Rep Exposure: ensure no external aliasing of representation.

## Example: ChangeOrder

AF: tuple {rfi, submittedBy, approved} ↦ abstract change-order  
RI:

- co.rfi exists
- if approved == True, then rfi.status ∈ {Submitted, Approved}
- only users with `Manager` role may approve
  Tests: provide unit/property tests & one E2E that exercises boundary behavior.
