# M5 — Messaging & notifications
**Goal:** one-to-one Conversations with live delivery; in-app Notifications for new Message, Application, decisions. **Owner:** B. **Depends on:** M1 (M3 events).
**Terms:** Conversation, Message, Notification.
**Rules owned:** none of R1–R5 (candidate extra rule: "a Conversation has exactly two distinct Students").

## Steps
1. [ ] **Domain:** `Conversation` (two sorted distinct participantIds, lastMessageAt), `Message` (≤2000 chars, non-empty).
2. [ ] Get-or-create Conversation idempotent for the same pair regardless of order.
3. [ ] **Use cases:** `SendMessage`, `ListConversations`, `ListMessages`, `MarkRead`, `ListNotifications`, `MarkNotificationRead`.
4. [ ] Only participants can read or send (403 otherwise).
5. [ ] **Socket.IO gateway** in `infrastructure/socket/`: authenticate handshake with the JWT, join per-Student room, emit `message:new`. The use case calls a `RealtimePublisher` port, not Socket.IO.
6. [ ] `NotificationPublisher` implementation: stores a Notification and emits to the Student's room.
7. [ ] **Report:** `ReportStudent` / `ReportConversation` use case (admin review in M6).
8. [ ] Deploy host must support WebSockets; test on the live URL.

## Tests
Participants-only access · idempotent get-or-create · length limits · unit test using a fake `RealtimePublisher` · one integration test with two socket clients.

## Doc hooks
- DESIGN: Boundary note — Socket.IO stays outside the core.
- TESTING: honest line about the socket test if it is flaky.

## Viva questions
- If we swap Socket.IO for SSE, which folders change?
