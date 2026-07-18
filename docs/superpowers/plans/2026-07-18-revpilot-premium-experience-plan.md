# RevPilot Premium Experience Implementation Plan

## Objective

Deliver the validated premium RevPilot experience: a crawlable marketing homepage at `/`, the existing working dashboard at `/app`, a shared Quiet Luxury design system, purposeful motion, responsive behavior, accessibility, tests, and production verification.

## Guardrails

- Preserve analysis, CSV, PMS, event, notification, decision, and video-presentation behavior.
- Do not invent customers, performance claims, certifications, integrations, or security guarantees.
- Keep GitHub Pages deployment compatible.
- Prefer focused extraction over a wholesale application rewrite.
- Support reduced motion and keyboard interaction from the start.
- Keep unrelated untracked files and user changes untouched.

## Phase 1: Specialist Audits and Baseline

1. Read and apply the installed `ui-ux-pro-max`, `frontend-design`, `seo-audit`, and `senior-backend` guidance relevant to this scope.
2. Record the current test, TypeScript build, bundle, and visual baseline.
3. Inspect the current routing constraints, GitHub Pages base path, presentation query parameters, and service boundaries.
4. Identify accessibility, responsive, SEO, and integration-state risks that must be covered by implementation tests.

Deliverable: an implementation checklist aligned with the existing code rather than a generic redesign.

## Phase 2: Route and Application Boundaries

1. Add route-resolution tests for `/`, `/app`, `/app/`, and demonstration query strings.
2. Introduce a dependency-free route boundary suitable for the two-route Vite application.
3. Move the existing dashboard orchestration into `DashboardApp` without changing behavior.
4. Keep presentation query parameters and local storage behavior scoped to the dashboard.
5. Add GitHub Pages fallback handling if the build requires it.

Verification: route tests, existing presentation tests, existing application tests, production build.

## Phase 3: Shared Design and Motion Foundations

1. Define Quiet Luxury tokens for color, typography, spacing, radius, elevation, breakpoints, focus, and semantic states.
2. Add shared UI primitives only where both marketing and product views need consistent behavior.
3. Add a small motion layer for reveal, count-up, chart entrance, and panel transitions.
4. Implement `prefers-reduced-motion` and touch/mobile fallbacks before applying visual effects.
5. Verify contrast, keyboard focus, and compositor-friendly animation properties.

Verification: component tests for interaction semantics and reduced motion; manual desktop/mobile token review.

## Phase 4: Marketing Homepage

1. Add tests for semantic landmarks, one H1, main calls to action, internal navigation, and deterministic preview data.
2. Build the header and hero with a real RevPilot value proposition and direct `/app` action.
3. Build the staged product preview using bundled synthetic values only.
4. Build problem, workflow, benefits, product demonstration, integrations, trust, and final CTA sections.
5. Add a coherent footer and accurate product/legal wording.
6. Add page title, description, canonical, Open Graph, social metadata, and crawlable content.
7. Apply signature reveal motion with a fully static reduced-motion state.

Verification: homepage tests, responsive review, keyboard navigation, reduced-motion review, SEO audit.

## Phase 5: Dashboard Premium Redesign

1. Add or update tests around critical actions before extracting presentation components.
2. Rework navigation, top bar, hotel context, and status strips using the shared system.
3. Redesign KPIs and priority recommendations around where, why, action, and impact.
4. Restyle charts, advanced workspace, calendar/table, import help, and footer.
5. Redesign drawers, modals, notifications, PMS settings, decision forms, loading, empty, and failure states.
6. Preserve all existing event handlers, state transitions, imports, and service calls.
7. Add count-up, chart, recommendation, modal, and micro-interaction motion without continuous decoration.
8. Add purpose-built tablet and mobile layouts, including safe table alternatives and touch-friendly controls.

Verification: all existing tests, new critical-flow tests, desktop/tablet/mobile review, keyboard-only review.

## Phase 6: Performance, Accessibility, and SEO Hardening

1. Lazy-load dashboard-only visualization code from the marketing route.
2. Check bundle output and remove unnecessary animation or asset cost.
3. Verify headings, landmarks, names, focus management, dialogs, contrast, status semantics, and graph summaries.
4. Verify canonical behavior and metadata in the built GitHub Pages artifact.
5. Test direct navigation and refresh for `/` and `/app` in the production preview.

Verification: production build, static artifact inspection, accessibility checklist, performance checklist, SEO checklist.

## Phase 7: Final Review and Delivery

1. Run the complete test suite and production build.
2. Use `code-review` on the final diff and fix all high-confidence issues.
3. Re-run specialist audits for UI/UX, frontend distinctiveness, SEO, and integration boundaries.
4. Review the final application in desktop and mobile browsers.
5. Summarize changes, test evidence, residual limitations, and deployment steps.

## Expected File Boundaries

- `app/src/marketing/` for homepage sections and homepage-only presentation.
- `app/src/dashboard/` for extracted dashboard presentation components.
- `app/src/components/ui/` for genuinely shared primitives.
- `app/src/styles/` for tokens, base rules, marketing, dashboard, motion, and responsive layers.
- `app/src/lib/` for route and presentation helpers with focused tests.
- `app/index.html` and public assets for accurate metadata and social presentation.

Exact extraction boundaries may be narrowed during implementation when keeping an existing component intact is safer than splitting it.

## Completion Criteria

The work is complete when `/` and `/app` render the validated experience, critical functionality remains intact, automated tests and production build pass, specialist reviews have no unresolved high-confidence issues, and the result has been checked at desktop, tablet, mobile, keyboard-only, and reduced-motion settings.
