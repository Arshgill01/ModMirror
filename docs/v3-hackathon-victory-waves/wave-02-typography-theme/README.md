# Wave 02: Typography & Appearance Refinement

## 🎯 Objective
Improve ModMirror's visual presentation while keeping the app fast, dense, and operational. Do not add external font services, decorative glassmorphism, or visual styling that makes moderation workflows harder to scan.

## 📂 Target Files
* **[MODIFY]** `src/client/index.html`
* **[MODIFY]** `src/client/styles.css`

## 🛠️ Step-by-Step Implementation Instructions

### 1. Typography Setup
* Do not import Google Fonts or any other external font service.
* Keep `src/client/index.html` free of third-party font/network hints unless the maintainer explicitly approves the dependency.
* Use a system font stack for body text and headings so the Devvit WebView remains fast and privacy-conscious.
* Tighten heading weights, line heights, and spacing using local CSS only.

### 2. Design Tokens Setup (`styles.css`)
* Keep the existing restrained operational palette unless a specific readability issue requires changing it.
* Avoid one-note dark blue/slate dominance, oversized rounded cards, glass blur, and decorative shadows.
* Preserve compact panel density and 8px-or-less radii unless an existing component requires otherwise.

### 3. Responsive Shell & Micro-animations
* Add hover/focus states only where they improve affordance.
* Do not use transforms that shift dense operational lists or make the layout feel unstable.

## 🧪 Verification Plan
* Run `npm run type-check`, `npm run lint`, `npm test`, and `npm run build`.
* Verify text remains readable and non-overlapping in compact and expanded Devvit WebView layouts.
* Verify the page makes no new third-party network requests for visual assets.
