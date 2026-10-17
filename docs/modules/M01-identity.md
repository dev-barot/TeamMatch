# M1 — Identity (Account, Student, Profile)
**Goal:** a Student can sign up, verify email, log in, refresh, reset password, edit their own Profile. **Owner:** A. **Depends on:** M0.
**Terms:** Account, Account Type, Student, Profile, Skill, Specialty, Working Style, Email Verification.
**Rules owned:** **R2** (own-profile part), **R5** (verified gate).

## Steps
1. [x] **Domain:** `Account` (email, passwordHash, accountType, isEmailVerified, isActive), `Profile` value object with validation (bio ≤ 500, availability ≥ 0, valid IANA timezone, enums). Pure JS.
2. [x] **Domain:** `Skill.normalize()` — trim, case-insensitive, de-duplicate ("react" == "React").
3. [x] **Ports:** `StudentRepository`, `PasswordHasher`, `TokenSigner`, `Mailer`, `Clock`.
4. [x] **Use cases:** `SignUp`, `VerifyEmail`, `LogIn`, `RefreshAccessToken`, `RequestPasswordReset`, `ResetPassword`, `UpdateProfile`, `GetOwnProfile`, `GetStudentPublicView`.
5. [x] **Infrastructure:** Mongoose `StudentRepository`; bcrypt (cost 10–12) hasher; JWT signer (access 1h, refresh 7d httpOnly+secure cookie); Mailer (real provider + console fallback).
6. [x] **HTTP:** routes from PRD §7.1 Auth/Users; Zod schemas per route; `requireAuth`, `requireVerified` middleware; rate limit on auth routes.
7. [x] **R5:** `requireVerified` used on create-project and apply routes (wired in M2/M3). Domain-level check lives in the use case too (don't trust only middleware).
8. [x] **Privacy:** `GET /users/:id` returns a limited DTO; only in matching/application/conversation context (stub check now, tighten in M3/M5).
9. [x] Never return `passwordHash`; DTO test proves it.
10. [ ] Deploy; sign up on the live URL.

## Tests (name them with the rule id)
- Unit: Profile validation, Skill normalization, reset token single-use + 1h expiry (fake Clock).
- Integration: signup → verify → login → refresh; wrong password; deactivated Account cannot log in.
- `R2: a Student cannot PATCH another Student's Profile` (403).
- `R5: unverified Student cannot create a Project` (written in M2).

## Doc hooks
- DESIGN: candidate Decision on **DIP** — `PasswordHasher`/`TokenSigner` ports instead of calling bcrypt/jwt inside use cases. Record the *before* commit.
- TESTING: R2 row (profile part), R5 row.

## Viva questions
- Where is the verified-email check enforced, and what if the route forgets the middleware?
