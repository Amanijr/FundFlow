# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Finance and operations staff at civil society institutions—NGOs, CBOs, foundations, charities, development organizations, and grant-funded nonprofits. Daytime desk work: contributions, funds, expenses, budgets, projects/grants, accounting, and reporting.

Church congregation/ministry operations are **out of product scope** (separate CMS product direction). CrossLife church pilot data may remain as legacy/demo only until migrated.

## Product Purpose

FundFlow ERP is a multi-tenant financial management system for civil society institutions: contributions and income, donors/funding sources, fund accounting, budgeting, expenses, programs/grants, financial reporting, approvals, and organizational accountability.

Success means money is traceable (source → allocation → spend → balance), budgets are respected, and reports are audit-ready—with simple, understandable UX.

## Positioning

Dedicated financial management for CSOs—not a church management system, not consumer banking, not general membership CRM. Single money path (donation/contribution → payment → funds/accounting). Programs/grants support restricted funding; church membership, ministries, attendance, and congregation workflows belong to a separate CMS product.

## Operating Context

Staff sign in to role-aware dashboards, receive gifts, manage donors/campaigns, approve expenses, post journals, and export reports. Demo/mock mode supports UI exploration without a live API. CrossLife is a pilot/demo tenant, not the product identity.

## Capabilities and Constraints

- Web app: Next.js frontend (`frontend/`) + Spring API; local mock API via `NEXT_PUBLIC_MOCK_API`.
- Core domains: donors, donations, payments, campaigns, funds, budgets, expenses, accounting, reports, admin, platform owner, programs/grants/church/school verticals.
- Public hosted giving / Lipa self-serve is parked until explicitly requested.
- Church vertical (members, ministries, services, attendance, partnerships, Sunday-collection UX) is scheduled for removal from the FundFlow product surface per TASK 00; DB tables parked, not dropped, until CMS extraction is approved.
- School sponsorships: undecided keep vs park.
- Undecided: production gateway vendor details beyond Phase-1 thin payment path.
- Scope audit: `docs/architecture/TASK_00_PRODUCT_SCOPE_REDEFINITION.md`.

## Brand Commitments

- Product name: **FundFlow** (not CrossLife).
- Confirmed visual system (Nov 2026): premium light-mode fintech SaaS—light gray canvas, pure white sidebar, bordered bento cards, matte dark navy type, solid digital cyan primary CTAs, muted emerald / soft crimson status surfaces with slate icons. Flat, precise, minimalist. Light mode is the primary target; dark mode follows later without blocking this pass.
- CrossLife branding remains pilot/demo content only.

## Evidence on Hand

- Live app shell and modules under `frontend/`.
- Product docs under `docs/`; getting-started and user manuals.
- Mock fixtures for demo walkthroughs.
- Do not invent customer logos, testimonials, pricing, or benchmarks.

## Product Principles

1. Accountability first — every financial action must be traceable.
2. Reporting-driven — modules feed meaningful, exportable reports.
3. Audit-ready — verifiable trails for nonprofit finance staff and auditors.
4. Multi-tenant isolation — org data never crosses tenant boundaries.
5. One money model — parallel intakes reuse Donation + Payment; no parallel money entities without explicit request.
