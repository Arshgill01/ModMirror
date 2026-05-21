# Wave 17 — Case Packet And Evidence Board Continuity

Status: complete

## Objective

Make the proof workflow feel connected across receipts, Case Packets, Evidence
Boards, and review surfaces.

## Scope

- Add receipt-ledger navigation to generate a Case Packet from a receipt.
- Preserve the existing Case Packet to Evidence Board path.
- Add Evidence Board return controls back to receipt review and packet review.
- Replace raw evidence source names with provenance labels that distinguish
  receipt-backed, packet-backed, snapshot-backed, demo, inferred, manual, and
  unavailable evidence.

## Acceptance Evidence

- Receipt ledger rows now offer `Generate case packet` and `Open evidence
  board`.
- Evidence Board rows can return to the receipt ledger or current Case Packet
  when those subject references exist.
- Static/demo Case Packet fallback works for demo receipt/action subjects.
- Evidence rows render explicit source labels such as `Receipt-backed`,
  `Demo override`, `Inferred comparable case`, or `Packet-backed`.
