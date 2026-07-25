# COMPONENT INVENTORY

Version: 1.0

---

# Purpose

This document defines all reusable frontend components used throughout FundFlow ERP.

Every screen must be assembled from approved components.

Developers and AI agents must reuse existing components before creating new ones.

New components require architectural justification.

---

# Component Philosophy

FundFlow follows a component-first architecture.

Pages are compositions of reusable building blocks.

Good:

Page
→ PageHeader
→ FilterBar
→ DataTable

Bad:

DonorTable
CampaignTable
ExpenseTable

Each implementation should reuse shared components.

---

# Component Classification

Components are grouped into:

1. Layout Components
2. Navigation Components
3. Data Display Components
4. Form Components
5. Reporting Components
6. Feedback Components
7. Workflow Components
8. Security Components

---

# Layout Components

## AppShell

Purpose

Main application layout.

Contains:

* Header
* Sidebar
* Content Area

Used By

All authenticated pages.

---

## ContentContainer

Purpose

Standard page width and spacing.

Responsibilities

* Consistent padding
* Responsive behavior

---

## PageHeader

Purpose

Standard page header.

Contains

* Breadcrumbs
* Title
* Description
* Primary Action

Examples

Donors
Campaigns
Expenses
Funds

---

## SectionHeader

Purpose

Labels major sections.

Contains

* Title
* Description
* Optional Actions

---

# Navigation Components

## Sidebar

Purpose

Main navigation.

Features

* Collapsible
* Role-aware
* Nested Groups

---

## TopNavigation

Contains

* Search
* Notifications
* Quick Actions
* Organization Switcher
* User Menu

---

## Breadcrumbs

Purpose

Provide context.

Example

Dashboard
→ Fundraising
→ Donors
→ Donor Detail

---

## CommandPalette

Purpose

Global search and actions.

Shortcut

CMD + K
CTRL + K

Supports

* Navigation
* Search
* Quick Create

---

# Dashboard Components

## KPIWidget

Purpose

Display single metric.

Examples

* Total Donations
* Total Expenses
* Active Campaigns

Props

* Label
* Value
* Trend
* Change Percentage

---

## MetricCard

Purpose

Compact business metric.

Variants

* Success
* Warning
* Danger
* Neutral

---

## TrendChart

Purpose

Display trends.

Examples

* Donation Growth
* Expense Trends
* Budget Utilization

Built With

Recharts

---

## RecentActivityFeed

Purpose

Display recent events.

Examples

* Donation Received
* Expense Approved
* Budget Updated

---

# Data Display Components

## DataTable

Purpose

Primary ERP table component.

Built With

TanStack Table

Required Features

* Search
* Sorting
* Filtering
* Pagination
* Bulk Actions
* Export
* Column Visibility

No alternative table implementations allowed.

---

## FilterBar

Purpose

Provides filtering controls.

Contains

* Search
* Filters
* Saved Views
* Reset Filters

---

## EntityHeader

Purpose

Record summary.

Examples

Donor Detail
Campaign Detail
Expense Detail

Contains

* Title
* Status
* Metadata
* Actions

---

## DetailCard

Purpose

Displays grouped information.

Examples

Contact Information
Campaign Summary
Budget Summary

---

## StatusBadge

Purpose

Display status.

Variants

* Draft
* Pending
* Approved
* Rejected
* Archived

---

## EmptyState

Purpose

Display empty collections.

Contains

* Icon
* Message
* Action

---

# Form Components

## FormSection

Purpose

Groups related fields.

Examples

General Information
Financial Information
Contacts

---

## FormField

Purpose

Shared field wrapper.

Supports

* Label
* Description
* Validation
* Help Text

---

## CurrencyInput

Purpose

Monetary values.

Features

* Currency formatting
* Validation

---

## DateInput

Purpose

Date selection.

Built With

shadcn Date Picker

---

## EntitySelector

Purpose

Reference existing records.

Examples

Select Donor
Select Campaign
Select Fund

---

## FileUploader

Purpose

Document uploads.

Supports

* Multiple Files
* Drag and Drop
* Validation

---

# Reporting Components

## ReportFilters

Purpose

Report filtering.

Supports

* Date Range
* Organization
* Fund
* Campaign

---

## ReportSummary

Purpose

Report KPIs.

Examples

Total Donations
Total Expenses
Net Position

---

## ReportTable

Purpose

Detailed report records.

Built On

DataTable

---

## ExportActions

Purpose

Export functionality.

Supports

* PDF
* Excel
* CSV

---

# Workflow Components

## ActivityTimeline

Purpose

Displays chronological events.

Examples

Donation Lifecycle

Created
Approved
Receipt Generated
Posted To Ledger

---

## AuditTrail

Purpose

Displays immutable history.

Fields

* User
* Action
* Timestamp

Required For

* Donations
* Expenses
* Budgets
* Funds
* Users

---

## ApprovalWorkflow

Purpose

Approval management.

Supports

* Approve
* Reject
* Return For Revision

---

## WorkflowStatus

Purpose

Visual workflow stage indicator.

Examples

Draft
Review
Approved
Completed

---

# Security Components

## PermissionGate

Purpose

Conditional rendering.

Examples

Only show:

* Create User
* Delete Campaign
* Approve Expense

when permission exists.

---

## RoleGuard

Purpose

Restrict access based on role.

Examples

Finance Officer
Administrator

---

# Feedback Components

## SuccessAlert

Purpose

Successful actions.

---

## ErrorAlert

Purpose

System errors.

---

## WarningAlert

Purpose

Warnings.

---

## ConfirmDialog

Purpose

Destructive actions.

Examples

Delete Campaign
Delete User
Archive Fund

---

## LoadingState

Purpose

Loading indicator.

Variants

* Skeleton
* Spinner

Skeletons preferred.

---

# Shared Charts

Approved Chart Types

* Line Chart
* Bar Chart
* Area Chart
* Pie Chart
* Donut Chart

Built With

Recharts

Avoid custom chart implementations.

---

# Component Ownership Rules

Shared Components

`frontend/src/components/`

Business Components

`frontend/src/features/{module}/components`

Never duplicate shared components.

---

# Component Naming Rules

Good

DataTable
FilterBar
PageHeader
AuditTrail

Bad

CampaignTable
ExpenseTableV2
DonorHeaderNew

Names must describe purpose, not module.

---

# AI Agent Rules

Before creating a component:

1. Check inventory.
2. Reuse existing component.
3. Extend existing component if possible.
4. Create new component only if no existing component fits.

Never generate duplicate implementations.

Consistency is more important than speed.

---

# Success Criteria

A component is approved when:

* Reusable across modules
* Accessible
* Responsive
* Type-safe
* Consistent with design system
* Compatible with shadcn/ui architecture

End of Document.
