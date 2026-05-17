# AGENT F — Real Mod Workflow Hardening

Goal: make sure the app is not only a dashboard; actual moderation flows remain usable.

Tasks:
1. Audit Apply Policy flow.
2. Ensure it works with new shell/navigation.
3. Ensure no-policy fallback routes to policy creation.
4. Ensure override capture still works.
5. Ensure action events are stamped with policy version/snapshot.
6. Ensure Case Packet can be generated from action context where existing data allows.
7. If delivery mode is uncertain, keep log_only as safe default.
8. Add copy explaining simulated/log-only vs live actions.

Acceptance: Apply Policy, override capture, and Case Packet generation still work; no hidden destructive action is added.
