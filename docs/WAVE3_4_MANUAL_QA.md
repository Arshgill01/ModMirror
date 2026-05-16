# WAVE3_4_MANUAL_QA.md

Manual checklist for the first complete ModMirror policy loop.

## Browser / Playtest

- [x] `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- [x] Safari opened the playtest URL.
- [x] Complete Reddit/Google login consent if required.
- [x] Confirm the ModMirror dashboard launcher appears in the subreddit
      moderator menu.
- [x] Confirm the dashboard launcher opens a confirmation form without creating
      a visible post.
- [x] Confirm the ModMirror dashboard renders inside Reddit.

Current browser result: Safari is signed in, opens the playtest subreddit,
shows "Open ModMirror dashboard" in the subreddit moderator overflow menu, and
opens the confirmation form. After approval, it created
`/r/modmirror_dev/comments/1teywdj/modmirror_policy_dashboard/`; the dashboard
WebView rendered the ModMirror navigation and demo Mirror Scan drift output.

## Dashboard Loop

- [x] Open Mirror Scan.
- [x] Click Use Demo Data.
- [x] Confirm Rule 2 drift candidate appears with confidence label.
- [x] Open Policies from the Rule 2 drift candidate.
- [x] Click Open policy flow from the Rule 2 drift candidate.
- [ ] Confirm policy appears in the policy table.
- [ ] Edit the policy and save a changed action step.
- [ ] Open Apply Policy.
- [ ] Select the Rule 2 policy.
- [ ] Preview recommendation for `learner_1`.
- [ ] Confirm a matching action and verify log-only success.
- [ ] Select a deviating action without override reason and verify rejection.
- [ ] Select a deviating action with an override reason and verify success.
- [ ] Open Overrides after integration and verify aggregate counts.

## Safety Checks

- [ ] Confirm delivery mode remains `log_only`.
- [ ] Confirm no automatic ban execution occurs.
- [ ] Confirm override summary is aggregate-first and does not show per-mod
      breakdowns.
- [ ] Confirm demo data is clearly labeled and not mixed with live scan data.
