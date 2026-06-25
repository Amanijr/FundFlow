# ERD.md

## Existing Entities

Donor
|
+-- Donation
|
+-- Payment

---

## Target Domain Model

Organization
|
+-- User
|
+-- Donor
|     |
|     +-- Donation
|             |
|             +-- Payment
|
+-- Campaign
|
+-- Expense
|
+-- Budget
|
+-- Fund
|
+-- Account
|     |
|     +-- JournalEntry
|             |
|             +-- JournalLine
|
+-- Grant
|
+-- Asset

---

## Accounting Relationships

Donation
|
+-- JournalEntry

Expense
|
+-- JournalEntry

Payment
|
+-- JournalEntry

All financial events must generate accounting records.
