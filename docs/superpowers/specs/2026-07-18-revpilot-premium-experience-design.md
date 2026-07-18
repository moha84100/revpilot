# RevPilot Premium Experience Design

## Objective

Transform RevPilot into a premium hospitality software experience that is credible enough to sell to independent hotel managers and visually distinctive enough to create an immediate “wow” effect.

The project includes two connected experiences:

- a new public marketing homepage at `/`;
- a complete “Quiet Luxury” visual redesign of the existing product at `/app`.

The redesign must preserve RevPilot’s current analysis logic, PMS and event integrations, notifications, CSV imports, decision workflow, and demonstration data. Authentication, billing, backend migration, and new revenue-management algorithms are outside this scope.

## Success Criteria

- The homepage clearly explains what RevPilot does, for whom, why it is trustworthy, and how to enter the demonstration.
- The product communicates the daily priority in seconds: where to act, why, and the estimated financial impact.
- The homepage creates a memorable visual moment without making the dashboard distracting.
- Desktop, tablet, and mobile layouts remain usable and visually intentional.
- Keyboard navigation, contrast, focus states, reduced-motion behavior, and semantic structure meet a high accessibility standard.
- The production build, current business-logic tests, new navigation tests, and critical UI tests pass.
- The public homepage is technically indexable and has complete page metadata.

## Product Architecture

### Routes

- `/` renders `MarketingHome`, the public commercial experience.
- `/app` renders `DashboardApp`, the existing RevPilot workflow in the new design system.
- Existing demonstration query parameters remain supported on `/app` so commercial video and capture workflows do not break.
- Direct visits and browser navigation work on GitHub Pages through the existing Vite deployment model.

No fictional login wall is introduced. Primary calls to action open `/app`; secondary calls can scroll to the product demonstration or commercial explanation.

### Application Boundary

The current monolithic application is separated at the presentation boundary, not rewritten at the business-logic layer. Analysis, formatting, workflow, CSV, event, PMS, and notification modules keep their existing interfaces. The redesign consumes those modules through the current application state.

This isolates visual work from the validated calculation code and makes future authentication or multi-hotel routing possible without another visual rewrite.

## Visual Direction: Quiet Luxury

### Brand Character

The interface should feel like a refined independent hotel: calm, precise, warm, attentive, and confident. It must avoid generic blue SaaS styling, excessive glass effects, neon “AI” visuals, and decorative clutter.

The palette uses:

- warm ivory for primary surfaces;
- deep forest green for navigation and authority;
- restrained champagne for premium emphasis and important opportunities;
- muted stone and sage tones for secondary information;
- semantic red, amber, and green reserved for operational status.

Display typography has an editorial hospitality character. Interface typography remains highly legible for numbers, tables, labels, and controls. Large values use tabular numerals where alignment matters.

### Design System

A shared design-system layer defines:

- colors and semantic states;
- typography and numeric styles;
- spacing, radii, borders, elevation, and responsive breakpoints;
- buttons, cards, badges, inputs, segmented controls, tables, drawers, modals, and empty/error states;
- motion durations, easing curves, reveal patterns, focus states, and reduced-motion alternatives.

The homepage and dashboard use the same tokens and primitives so the transition from promise to product feels continuous.

## Marketing Homepage

### Hero

The hero immediately states the value proposition for independent hotels: identify fast-selling dates earlier, understand the reason, and keep the final pricing decision.

It includes:

- a concise headline and supporting sentence;
- a primary “Découvrir la démo” action to `/app`;
- a secondary product-explanation action;
- a polished live product preview built from representative RevPilot data;
- trust language explaining that recommendations remain consultative.

The hero’s visual “wow” moment is the controlled construction of the product preview: shell, KPIs, chart, then a highlighted recommendation. The sequence is short, interruptible, and not replayed continuously.

### Narrative Sections

The remaining homepage follows a commercial story:

1. the hotel manager’s current problem: late signals and intuition-led pricing;
2. the RevPilot workflow: detect, explain, decide;
3. key benefits: earlier action, explainable recommendations, retained control;
4. a detailed interactive or animated product demonstration;
5. integrations and data sources, clearly separating live-capable connectors from demo data;
6. security and trust: read-only PMS connection, traceable recommendations, no automatic price changes;
7. a final call to action to enter the demonstration.

Claims must remain supportable by the current product. Placeholder customer logos, invented testimonials, fabricated performance statistics, and fake security certifications are prohibited.

## Dashboard Experience

### Information Hierarchy

The default dashboard answers three questions in order:

1. Where should the manager act?
2. Why is the date important?
3. What decision is recommended and what is its estimated impact?

The page retains simple and advanced modes, but the simple mode becomes the primary polished daily workspace. The advanced mode remains available for analysis and controls without dominating the first screen.

### Main Areas

- A deep-green navigation rail contains brand, hotel context, main destinations, presentation access, and privacy status.
- A refined top bar contains greeting, date, mode control, notifications, and data actions.
- A quiet data-source status area summarizes PMS, event providers, and freshness without competing with business priorities.
- KPI cards emphasize occupancy, average rate, revenue opportunity, and urgent actions.
- Priority recommendations appear before detailed tables, with clearer reasons, confidence, impact, and decision action.
- The chart area uses progressive drawing and improved annotations while retaining accurate values.
- Drawers and modals become focused decision spaces with strong hierarchy and restrained depth.
- Tables remain dense enough for hotel operations but gain better alignment, scanning, hover, keyboard, and responsive behavior.

### Responsive Behavior

Desktop uses the full navigation rail and multi-column analysis. Tablet collapses secondary information before reducing primary action space. Mobile uses a compact top navigation, single-column priority flow, horizontally safe tables or purpose-built mobile rows, and simplified motion.

Responsive adaptation must not merely shrink the desktop layout. Critical actions remain reachable without precision tapping or hidden horizontal overflow.

## Motion System

Motion is calm during daily use and expressive only at selected moments.

### Signature Moments

- Homepage product reveal: staged shell, metrics, chart, and recommendation.
- Chart entrance: paths and bars build progressively when first visible.
- Recommendation reveal: a priority card opens with restrained depth and contextual emphasis.

### Micro-interactions

- subtle card lift and light response to pointer movement on capable desktop devices;
- numeric count-up for headline metrics on first appearance;
- smooth drawer, modal, filter, and mode transitions;
- button feedback and a very restrained magnetic response on primary marketing calls to action;
- short staggered section reveals triggered once.

Animations use transform and opacity whenever possible. No infinite decorative loops, scroll hijacking, heavy parallax, cursor replacement, or motion that delays a decision is allowed.

`prefers-reduced-motion` disables staged movement, count-up effects, pointer depth, and smooth page transitions while keeping all information immediately visible. Mobile uses fewer simultaneous effects.

## Component Structure

### Marketing Components

- `MarketingHome`
- `MarketingHeader`
- `HeroSection`
- `ProductPreview`
- `ProblemSection`
- `WorkflowSection`
- `BenefitsSection`
- `IntegrationsSection`
- `TrustSection`
- `MarketingCta`
- `MarketingFooter`

### Product Components

`DashboardApp` owns the existing orchestration state while focused components render navigation, status, KPIs, recommendations, analytics, calendar/table, advanced workspace, drawers, and dialogs. Extraction is limited to boundaries that reduce visual and behavioral coupling; unrelated business logic is not refactored.

### Shared Components

Shared primitives cover button, card, badge, status, input, segmented control, modal/drawer shell, section heading, metric, and animated reveal behavior. Each component has one clear visual role and exposes content through explicit props.

## Data Flow

The homepage uses a small, deterministic subset of existing synthetic data for its preview. It does not call PMS, event, notification, or private services.

Entering `/app` starts the current dashboard data flow:

1. deterministic demo data initializes the analysis;
2. the current services check PMS, notifications, and live events where appropriate;
3. analysis and summaries produce presentation-ready rows;
4. focused view components receive derived values and action handlers;
5. decisions and preferences continue using the existing storage behavior.

Route changes do not recreate or duplicate the revenue-management engine.

## Error and State Design

- PMS, event, and notification failures use a consistent inline status component with a plain-language explanation and available recovery action.
- Loading states preserve layout and identify what is being prepared.
- Empty states explain the next useful action rather than displaying blank panels.
- CSV validation errors remain actionable and do not discard the last valid dataset.
- Disabled, pending, success, warning, and failure states are visually and semantically distinct.
- Marketing-page failure cannot block access to `/app`, because the homepage depends only on bundled assets and demo data.

## SEO

The public homepage includes:

- a unique French title and meta description centered on hotel revenue management;
- canonical URL, robots directive, Open Graph, and social-card metadata;
- one descriptive H1 and semantic section headings;
- crawlable explanatory content, not text embedded only in animation;
- meaningful internal links and image alternative text;
- structured data only where the business information can be stated accurately.

The product route is not positioned as a duplicate marketing page. Deployment behavior and canonical handling are verified for GitHub Pages.

## Accessibility

- All functionality is keyboard operable.
- Focus indicators are always visible.
- Color is never the only signal for recommendations or status.
- Interactive targets have sufficient size and clear accessible names.
- Drawers and modals manage focus and expose correct dialog semantics.
- Graphs have textual summaries for essential conclusions.
- Contrast is verified across all normal, hover, disabled, and semantic states.
- Reduced-motion behavior is tested, not merely declared.

## Performance

- Prefer CSS and browser-native observation for motion.
- Add a motion dependency only when a signature effect cannot be implemented cleanly with the existing stack.
- Lazy-load heavy dashboard visualization code when it is not required by the homepage.
- Avoid autoplay video and large decorative assets in the first viewport.
- Keep animations on compositor-friendly properties.
- Verify production bundle output and responsive performance before deployment.

## Testing and Review

Automated verification covers:

- routing between `/` and `/app`;
- primary homepage calls to action;
- rendering of deterministic product-preview data;
- accessibility semantics for main navigation, dialogs, controls, and headings;
- reduced-motion behavior;
- critical responsive component states;
- preservation of existing analysis, CSV, PMS normalization, notification, and presentation tests;
- successful TypeScript and production builds.

Manual review covers desktop, tablet, and mobile layouts; keyboard-only use; hover and touch behavior; chart readability; modal focus; visual consistency; loading/error states; and GitHub Pages navigation.

Before release, apply focused reviews using the installed specialties:

- `ui-ux-pro-max` for usability, responsive patterns, and interaction quality;
- `frontend-design` for aesthetic distinctiveness and execution;
- `seo-audit` for the public homepage and deployment metadata;
- `senior-backend` only for integration-boundary and error-handling implications;
- `code-review` for the final implementation diff.

## Delivery Boundary

This design delivers a premium public homepage, a redesigned dashboard, shared visual primitives, motion, accessibility, SEO basics, responsive behavior, tests, and production verification.

It does not add authentication, subscriptions, a production database, automatic pricing changes, invented social proof, a new backend architecture, or new revenue-management algorithms.
