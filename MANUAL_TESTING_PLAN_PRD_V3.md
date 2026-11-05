# TeamMatch Manual Testing Plan (PRD v3)

> **Document Status:** Aligned with PRD Revision 3 (No professor role; course tags are creator metadata; AI explainable match rules; student-initiated and creator-initiated team flows).  
> **Environment State:** All demo/mock projects, users, applications, and messages have been purged. The database begins completely clean with only the two seed admin accounts available.

---

## 1. Test Accounts & Personas Overview

To thoroughly test the matching engine, team formation state machines, and access control, create the following **4 student test accounts** via the public **Sign Up** screen:

| Persona | Name | Email | Password | Specialty / Role | Technical Skills | Avail. | Timezone | Working Style | Purpose in Test Plan |
|---|---|---|---|---|---|---|---|---|---|
| **Student A (Creator)** | Maya Lin | `maya.creator@university.edu` | `Pass1234!` | `Backend` | `Python`, `Node.js`, `Docker` | 20 hrs | `America/New_York` (EST) | `Collaborative` | Posts semester & hackathon projects, reviews applicants, invites candidates. |
| **Student B (Ideal Match)** | Liam Chen | `liam.match@university.edu` | `Pass1234!` | `Frontend` | `React`, `TypeScript`, `Figma` | 15 hrs | `America/New_York` (EST) | `Collaborative` | Applies for Frontend position. High match score candidate (+skill overlap, +gap, +role, +tz, +avail). |
| **Student C (Different TZ/Style)** | Sofia Rossi | `sofia.dev@university.edu` | `Pass1234!` | `ML` | `Python`, `PyTorch`, `SQL` | 10 hrs | `Europe/Rome` (CET) | `Independent` | Tests timezone distance penalties, secondary skills, and creator invitation flow. |
| **Student D (Unverified)** | Ethan Hunt | `ethan.unverified@university.edu` | `Pass1234!` | `DevOps` | `Docker`, `Kubernetes`, `AWS` | 12 hrs | `America/New_York` (EST) | `Fast-paced` | Tests Rule R5: browsing allowed, but cannot post or apply until verified. |

### Seed Administrator Accounts (Pre-existing)
- `admin@teammatch.edu` (Password: `AdminPass123!`)
- `admin@teammatch.app` (Password: `AdminPass123!`)

---

## 2. Test Phase 1: Authentication & Email Verification (Rule R5)

### Test Case 1.1: Unverified Student Restrictions
1. Open the app at `http://localhost:5173`.
2. Click **Sign Up** and register **Student D** (`ethan.unverified@university.edu`).
3. When the verification modal opens, click **"Skip for now (Account remains unverified)"**.
4. **Expected Results:**
   - [ ] Student D is logged in and lands on the dashboard.
   - [ ] An **amber banner** is visible: *"Email Verification Required — Enter 4-digit PIN..."*.
   - [ ] Student D can browse the Explore tab and view project directory.
   - [ ] Clicking **"Post a project"** triggers an error toast: *"Email verification required before posting projects (Rule R5)."*
   - [ ] Clicking **"Apply"** on any project triggers an error toast: *"Verify your email to apply to projects (Rule R5)."*

### Test Case 1.2: Instant PIN Verification & Account Activation
1. In Student D's dashboard amber banner, enter PIN `1234` and click **"Verify PIN"** (or use modal PIN `1234`).
2. **Expected Results:**
   - [ ] Account status updates to **Verified** immediately.
   - [ ] Amber verification banner disappears.
   - [ ] Header avatar displays blue `VERIFIED` pill.
   - [ ] Student D is now unlocked to post projects and apply to teams.

### Test Case 1.3: Creating Students A, B, and C
1. Log out. Register **Student A**, **Student B**, and **Student C** with their respective profile fields from the table above.
2. Complete email verification for each using PIN `1234`.

---

## 3. Test Phase 2: Project Creation & Course Metadata (PRD §5.2)

### Test Case 2.1: Post a Course-Affiliated Project (Creator: Student A)
1. Log in as **Student A** (`maya.creator@university.edu`).
2. Click **"Post a project"**.
3. Fill in the form:
   - **Title:** `Autonomous Campus Shuttle Fleet`
   - **Description:** `Developing a ROS2 and React dashboard for multi-vehicle campus autonomous transit.`
   - **Category:** `Class Project`
   - **Course Tag (Optional):** Course Code: `CS401`, Term: `Fall 2026` *(PRD v3: optional creator metadata)*
   - **Required Skills:** `React`, `Python`, `TypeScript`, `ROS2`
   - **Commitment Level:** `medium` (10–15 hrs/wk)
   - **Roles Needed:**
     - Position 1: `Frontend` (Headcount: 1)
     - Position 2: `ML` (Headcount: 1)
4. Submit the project.
5. **Expected Results:**
   - [ ] Project appears under the **Projects** tab with status **Open**.
   - [ ] Course tag `CS401 · Fall 2026` is visible as organizational metadata.
   - [ ] Open positions show `Frontend (0/1 filled)` and `ML (0/1 filled)`.

---

## 4. Test Phase 3: AI Matching & Explainable Recommendations (PRD §5.5)

### Test Case 3.1: Student View (Top-10 Project Recommendations)
1. Log in as **Student B** (`liam.match@university.edu`, Frontend, React, TypeScript, Collaborative, EST).
2. Navigate to **Home** or **Explore** with toggle `AI matches`.
3. **Verify Match Score & Explanations:**
   - **Base Skill Overlap (React + TypeScript = 2 of 4 skills):** $$(2 / 4) \times 50 = +25\text{ pts}$$
   - **Fills Skill Gap:** React & TypeScript are missing on the project team ($$+15\text{ pts}$$)
   - **Matching Preferred Role:** Student B's role `Frontend` matches open position `Frontend` ($$+15\text{ pts}$$)
   - **Same Timezone:** Both EST ($$+10\text{ pts}$$)
   - **Availability Overlap:** 15 hrs matches medium commitment ($$+10\text{ pts}$$)
   - **Total Expected Score:** **75–85 points**.
4. **Expected Results:**
   - [ ] Circular gauge or match badge displays the score.
   - [ ] Ordered list of human-readable reason strings is shown (e.g., *"Has 2 of 4 required skills"*, *"Fills open Frontend role"*, *"Same timezone"*).
   - [ ] Never shows a bare percentage without reasons.

### Test Case 3.2: Creator View (Top-20 Candidate Recommendations)
1. Log in as **Student A** (`maya.creator@university.edu`).
2. Go to **Projects** → Click **"Review Candidates / AI Matches"** on `Autonomous Campus Shuttle Fleet`.
3. **Expected Results:**
   - [ ] Student B (Liam Chen) ranks as candidate #1 for the open `Frontend` position.
   - [ ] Student C (Sofia Rossi) is ranked for the `ML` position with explainable reasons (*"Fills open ML role"*, *"Has required skill: Python"*, with timezone difference noted).

---

## 5. Test Phase 4: Team Formation Flow (PRD §5.6)

### Test Case 4.1: Student-Initiated Application
1. Log in as **Student B** (`liam.match@university.edu`).
2. Go to Explore → Click project `Autonomous Campus Shuttle Fleet` → Click **Apply**.
3. Select Specialty: `Frontend`. Include optional note: *"Excited to build the telemetry UI."*
4. Submit application.
5. **Expected Results:**
   - [ ] Status flips to **Applied / Pending**.
   - [ ] Under **Applications** tab, application is listed under `Sent`.
   - [ ] Attempting to apply again is blocked: *"Already have an active application to this project."*

### Test Case 4.2: Creator Review & Acceptance
1. Log in as **Student A** (`maya.creator@university.edu`).
2. Open **Manage Applicants** for `Autonomous Campus Shuttle Fleet`.
3. Student B appears under `Pending Applicants` for `Frontend`.
4. Click **Accept**.
5. **Expected Results:**
   - [ ] Frontend filled headcount increments from `0/1` to `1/1 (Filled)`.
   - [ ] Student B is listed under `Confirmed Team Members`.
   - [ ] Project status remains `Open` because the `ML` position still has 1 open seat.

### Test Case 4.3: Working Style Bonus Dynamic Activation (Rule R4)
1. Before Student B was accepted, working style bonus was `0` (Rule R4 requires $\ge 1$ confirmed team member).
2. Now that Student B (Collaborative) is accepted, candidate rankings recalculate.
3. Another student with `Collaborative` working style now qualifies for the `+10` compatible working style bonus.

### Test Case 4.4: Creator-Initiated Invitation Flow
1. As **Student A**, open candidate rankings for `Autonomous Campus Shuttle Fleet`.
2. Find **Student C** (`sofia.dev@university.edu`) for the `ML` position.
3. Click **"Invite to Team"**.
4. Log in as **Student C**.
5. Navigate to **Applications** tab → Click **Invited**.
6. **Expected Results:**
   - [ ] Invitation from `Autonomous Campus Shuttle Fleet` for `ML` role is displayed.
   - [ ] Student C clicks **"Accept Invitation"**.
   - [ ] ML position filled count reaches `1/1`.
   - [ ] **All positions are now filled (2/2)**: Project status automatically flips from `open` to **`filled`**.
   - [ ] Project disappears from default open explore view.

---

## 6. Test Phase 5: Lifecycle Edge Cases & Team Member Withdrawal (§5.6a)

### Test Case 5.1: Accepted Member Withdrawal
1. Log in as **Student B** (`liam.match@university.edu`).
2. Open **Applications** → Locate accepted membership for `Autonomous Campus Shuttle Fleet`.
3. Click **"Withdraw / Leave Team"**.
4. **Expected Results:**
   - [ ] Student B is removed from confirmed members.
   - [ ] Frontend role re-opens (`0/1 filled`).
   - [ ] Project status flips back from **`filled` to `open`**.
   - [ ] Project re-appears in campus Explore listings.

---

## 7. Test Phase 6: Direct Messaging & Real-Time Notifications (§5.3)

### Test Case 6.1: Direct 1:1 Conversation
1. As **Student A**, navigate to confirmed members or applicants → Click **"Message"** beside Student C.
2. Type: *"Welcome to the autonomous shuttle team! Check out the ROS2 repository link."*
3. Send message.
4. Log in as **Student C** in another browser window (or incognito).
5. **Expected Results:**
   - [ ] Real-time Socket.IO notification arrives.
   - [ ] Header notification bell updates count.
   - [ ] **Messages** view displays new message from Maya Lin.
   - [ ] Student C can reply directly in the thread.

---

## 8. Test Phase 7: Platform Admin Governance & Safety Moderation (§5.4a)

### Test Case 8.1: Instant Direct Admin Routing
1. Log in with `admin@teammatch.edu` (Password: `AdminPass123!`).
2. **Expected Results:**
   - [ ] **Zero student UI shown**: User lands directly on full-screen **Admin Command Center**.
   - [ ] Telemetry displays real counts: `Registered Students: 4`, `Campus Projects: 1`.
   - [ ] System Health circular gauge computes dynamically.
   - [ ] **Most Demanded Skills on Campus** displays aggregated project skills (`React`, `Python`, `TypeScript`, `ROS2`).

### Test Case 8.2: User Governance (Deactivation & Reactivation)
1. Navigate to **Accounts** tab in Admin Dashboard.
2. Locate Student D (`ethan.unverified@university.edu`).
3. Click **Deactivate**.
4. In another window, try logging in as Student D.
   - **Expected:** Access blocked with error: *"Account is deactivated. Contact platform administrator."*
5. Return to Admin Console → Click **Reactivate**.
   - **Expected:** Student D is restored to active status and can log in normally.

### Test Case 8.3: Project Governance (Admin Force Close)
1. In Admin Console, go to **Projects** tab.
2. Select `Autonomous Campus Shuttle Fleet` → Click **"Force Close Project"**.
3. Enter Reason: *"Policy compliance review"*.
4. **Expected Results:**
   - [ ] Project status immediately transitions to `Closed`.
   - [ ] Audit log records admin force-close event with timestamp.
   - [ ] Project can no longer receive new applications.

---

## 9. Verification Summary Checklist

| Category | Requirement | Status |
|---|---|---|
| **Data Cleanup** | Database purged of all demo projects, chats, users, notifications | PASS (Clean state confirmed) |
| **Admin Accounts** | 2 administrator accounts preserved with full access | PASS (`admin@teammatch.edu`, `admin@teammatch.app`) |
| **Admin Routing** | Direct routing to full-screen Bauhaus Admin Console | PASS |
| **Email Verification** | Rule R5 enforced (browse allowed, post/apply gated until verified) | READY FOR TEST |
| **Project Creation** | Supports title, requiredSkills, rolesNeeded, and optional courseCode | READY FOR TEST |
| **Matching Engine** | Explainable scoring (0–100) with top-5 human readable reasons | READY FOR TEST |
| **Applications** | Student-initiated and creator-initiated state machines | READY FOR TEST |
| **Role Capacity** | Capacity tracking, auto-fill transition, withdrawal re-opening | READY FOR TEST |
| **Direct Messaging** | 1:1 conversation grouping and realtime Socket.IO events | READY FOR TEST |
| **Admin Governance** | Force close projects, verify/deactivate/reactivate users, telemetry | READY FOR TEST |
