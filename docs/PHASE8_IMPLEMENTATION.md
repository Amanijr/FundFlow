# Phase 8 Implementation — Communications

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Email channel | Done |
| SMS channel | Done |
| WhatsApp channel | Done |
| Donation receipts | Done |
| Communication audit log | Done |
| Auto-receipt on payment | Done |

## Architecture

```
communication/
├── config/CommunicationProperties.java
├── controller/CommunicationController.java
├── dto/
├── entity/
├── repository/
├── service/
│   ├── CommunicationService.java
│   ├── ReceiptService.java
│   └── provider/          # Pluggable channel senders
```

Channel senders use a **provider adapter pattern**. Current implementations log outbound messages (suitable for dev/test). Production can swap in SendGrid, Twilio, or WhatsApp Business API clients without changing business logic.

## Communication Log

Every outbound message is recorded in `communication_log` with:
- Channel, type, recipient, subject, body
- Status: `PENDING`, `SENT`, `FAILED`
- Optional reference to donation/payment

## API Endpoints — `/api/v1/communications`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/send` | Send custom email/SMS/WhatsApp message |
| GET | `/` | List communication log for organization |
| GET | `/donations/{donationId}` | Messages for a specific donation |
| GET | `/receipts/{donationId}` | Preview donation receipt |
| POST | `/receipts/{donationId}` | Send receipt (`channel`, `recipientOverride` optional) |

## Receipts

- Generated from completed donations with successful payments
- Auto-assigns receipt number (`RCP-{paymentId}`) when not already set
- Respects anonymous donations — auto-receipt skipped when donor identity is hidden
- Auto-sent via email after successful gateway/manual payment when enabled

## Configuration

```properties
communication.auto-receipt-enabled=true
communication.default-receipt-channel=EMAIL
```

## Auto-Receipt Hook

`PaymentProcessingService` calls `CommunicationService.sendAutoReceiptIfEnabled()` after successful payment posting.

## Next: Phase 9 — Organization-Specific Modules

Attendance, ministries, beneficiaries, and vertical-specific features.
