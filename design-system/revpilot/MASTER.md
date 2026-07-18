# RevPilot Design System

**Direction:** Quiet Luxury for independent hotel revenue management  
**Personality:** calm, precise, warm, attentive, credible  
**Design dials:** variance 6/10, motion 7/10, marketing density 4/10, dashboard density 7/10

## Design Thesis

RevPilot should feel like a refined independent hotel rather than a generic blue SaaS product. Editorial typography provides hospitality character; disciplined data typography preserves operational clarity. The distinctive signature is a living demand curve that connects commercial promise to real revenue-management decisions.

Avoid neon AI visuals, heavy glassmorphism, autoplay media, invented social proof, generic gradient statistics, and motion without a decision-making purpose.

## Color Tokens

| Role | Value | Use |
|---|---:|---|
| Forest | `#183129` | Primary authority, hero, navigation |
| Forest strong | `#10271F` | Deep navigation and contrast |
| Forest interactive | `#204438` | Product primary actions |
| Ivory | `#F4F0E7` | Marketing background |
| Paper | `#FBF9F4` | Cards and dialogs |
| Product canvas | `#F1ECE2` | Dashboard background |
| Champagne | `#B48F50` | Restrained emphasis |
| Champagne light | `#D6BD89` | Premium CTA on dark surfaces |
| Sage | `#DCE5DC` | Calm positive context |
| Body text | `#625F58` | Accessible secondary copy on ivory |
| Border | `#DDD6C9` | Hairlines and product boundaries |
| Success | `#39705C` | Connected, safe, positive |
| Warning | `#8B652B` | Attention without alarm |
| Destructive | `#A64943` | Surbooking and failure |

Normal text must meet 4.5:1 contrast. Large text and essential glyphs must meet at least 3:1. Color never carries a status without a label or icon.

## Typography

- **Editorial display:** `"Iowan Old Style", Baskerville, "Times New Roman", serif`
- **Interface and body:** `"Avenir Next", Avenir, "Segoe UI", sans-serif`
- **Data:** interface family with tabular numerals where alignment matters

Use editorial type for major promises, section theses, KPI values, and decision headlines. Use interface type for controls, labels, descriptions, tables, and status. No external web-font request is required.

## Shape and Depth

- Marketing cards: `3px 24px 3px 3px` to evoke a folded room card without literal decoration.
- Product cards: `3px 18px 3px 3px`.
- Pills and compact actions: fully rounded.
- Brand mark: circular with one softened square corner.
- Surfaces use hairlines first and restrained shadow second.
- Hover depth uses translation of at most 4px and never shifts neighboring layout.

## Spacing

Use a 4/8px base rhythm.

| Token | Value |
|---|---:|
| `xs` | `4px` |
| `sm` | `8px` |
| `md` | `16px` |
| `lg` | `24px` |
| `xl` | `32px` |
| `2xl` | `48px` |
| `3xl` | `64px` |
| marketing section | `100–155px` responsive |

## Interaction

- All interactive targets are at least 44×44px.
- Focus uses a visible 3px champagne ring with offset.
- Primary action names remain consistent from trigger through confirmation.
- Icon-only actions always have an accessible name.
- Dialogs expose `role="dialog"`, `aria-modal`, a labelled heading, initial focus, an Escape route, and a visible close control.
- Tables preserve desktop density and reduce to decision-critical columns on mobile.

## Motion

Motion is calm in daily use and expressive at three signature moments:

1. staged homepage product reveal;
2. progressive demand-curve drawing;
3. recommendation or decision-panel reveal.

Micro-interactions use 150–300ms transitions. Section entrances may use up to 700ms because they occur once and do not block interaction. Animate transform and opacity, never layout dimensions. Do not use infinite decorative animation, scroll hijacking, or a custom cursor.

`prefers-reduced-motion: reduce` must remove staged movement and immediately reveal all content.

## Responsive Rules

- Verify 375px, 768px, 1024px, and 1440px widths, plus phone landscape.
- Marketing content becomes a deliberate single-column narrative, not a scaled desktop page.
- The hero product preview has a purpose-built mobile composition.
- Dashboard navigation becomes an off-canvas rail below 850px.
- Dense tables hide non-critical columns on small screens and retain a labelled 44px open action.
- No page may create horizontal viewport overflow.

## Performance

- Marketing and dashboard code/CSS are split by route with `React.lazy`.
- The heavy occupancy chart remains dashboard-only and lazy-loaded.
- Use bundled vector graphics and CSS; no autoplay video or blocking font download.
- Reserve layout space for previews and lazy content.
- Keep input feedback under 100ms and per-frame motion compositor-friendly.

## Delivery Checklist

- [ ] Lucide or custom SVG only; no emoji icons
- [ ] One H1 per page and logical heading order
- [ ] Keyboard navigation and visible focus verified
- [ ] Touch targets at least 44px
- [ ] Contrast verified for text, status, hover, and focus
- [ ] Reduced motion verified
- [ ] 375px, 768px, 1024px, 1440px, and landscape verified
- [ ] No horizontal viewport overflow
- [ ] Marketing and dashboard bundles remain split
- [ ] Production `/`, `/app/`, 404, robots, sitemap, canonical, and noindex behavior verified
