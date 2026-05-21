# Policy Agreement Spec

Policy Agreement must mean real review/adoption artifacts.

## Lifecycle

- draft
- proposed
- under_review
- adopted
- superseded
- archived

## Review record

- reviewer username
- decision: approve / request_changes / abstain
- note
- timestamp

## Adoption

A policy version becomes active/adopted only through explicit adoption. The UI may support a single-mod quick adoption path, but it must be labeled as such.

## Required behavior

- Editing an adopted policy creates a new proposed version.
- Receipts reference the exact adopted policy version used at action time.
- Case Packets can detect policy changed since action.
