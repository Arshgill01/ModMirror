# Cross-Wave Architecture Targets

Target service boundaries:
- `contentSnapshots`
- `policyRecommendation`
- `moderationExecution`
- `actionReceipts`
- `scanHistory`
- `driftTrends`
- `policyRatification`
- `policyReplay`
- `casePackets`
- `evidenceBoard`
- `modNotes`
- `modmail`
- `retention`
- `runtimeCapabilities`
- `syntheticEval`

Do not force a massive rewrite. Extract when it reduces risk.

Every important event should have stable ID, subreddit, source, timestamp, schema version, and evidence/confidence where relevant.

UI should organize around:
- Act,
- Scan,
- Agree,
- Review,
- Prove,
- Configure.
