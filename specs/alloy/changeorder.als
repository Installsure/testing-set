module changeorder
open util/boolean
sig User { roles: set Role }
sig Role {} one sig Manager extends Role {}
abstract sig Status {} one sig Draft, Submitted, Approved extends Status {}
sig RFI { author: one User, status: one Status }
sig CO { rfi: one RFI, submittedBy: one User, approved: one Bool }
pred Invariants() {
  all co: CO | some co.rfi
  all co: CO | (co.approved = True) implies (co.rfi.status in (Submitted + Approved))
  all co: CO | (co.approved = True) implies (Manager in co.submittedBy.roles)
}
run Invariants for 10
