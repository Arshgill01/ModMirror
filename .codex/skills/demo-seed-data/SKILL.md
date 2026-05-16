---
name: demo-seed-data
description: Create, update, or review ModMirror deterministic demo mode data, including fake subreddit rules, historical moderation actions, policy ladders, override events, drift examples, and seeded screenshots/video states. Use whenever demo data or cold-start behavior is touched.
---

# Demo Seed Data

Use this skill to keep demo mode realistic, deterministic, and clearly labeled.

## Requirements

Demo mode must include:

- fake subreddit such as `r/ExampleLearning`
- rules:
  - Rule 1: Be civil
  - Rule 2: Low-effort questions
  - Rule 3: Self-promotion
- 50-80 historical actions
- intentional Rule 2 drift across first-time cases
- mostly consistent Rule 3 enforcement
- Rule 1 severe-case escalation examples

## Data Principles

- Mark all demo output clearly as demo data.
- Use stable IDs and timestamps relative to a fixed seed date or deterministic generator.
- Include enough matched and unmatched examples to show honest confidence scoring.
- Avoid real usernames, real subreddits, or sensitive-looking content.
- Store demo records under namespaced Redis keys or deterministic in-code fixtures.

## Drift Design

Rule 2 should show the core product story:

- warnings for some first-time cases
- removal-only for others
- temporary-ban suggestions for others

Rule 3 should be a contrast case with consistent enforcement.

Rule 1 should show severe cases that justify escalation, so ModMirror does not look rigid.

## Validation

Add tests or fixture checks for:

- seed size
- rule coverage
- confidence label distribution
- drift candidate generation
- no real subreddit/user leakage
