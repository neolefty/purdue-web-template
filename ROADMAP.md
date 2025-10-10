# Roadmap

This document tracks planned features and improvements for future development.

## High Priority

### Responsive Design / Mobile Layouts
**Status:** Planned
**Effort:** Medium

Currently the application works best on desktop screens. Need to implement responsive design patterns for mobile and tablet devices:

- [ ] Make navigation/header responsive (hamburger menu for mobile)
- [ ] Optimize table layouts for small screens (cards or stacked rows instead of tables)
- [ ] Test all forms on mobile devices
- [ ] Ensure touch-friendly button/link sizes
- [ ] Review ManageUsersPage table on mobile
- [ ] Test login/register flows on phones

**Technical approach:**
- Use Tailwind responsive utilities (`sm:`, `md:`, `lg:` breakpoints)
- Consider mobile-first approach
- Test on actual devices or browser dev tools

---

## Medium Priority

### Email Customization
**Status:** Idea
**Effort:** Small

Allow more customization of email templates:

- [ ] Make email templates editable (possibly via admin interface)
- [ ] Support HTML email templates
- [ ] Add email preview functionality
- [ ] Logo/branding in emails

### User Profile Enhancements
**Status:** Idea
**Effort:** Small-Medium

- [ ] Profile pictures/avatars
- [ ] Additional profile fields (phone, department, etc.)
- [ ] User preferences/settings

### Admin Dashboard
**Status:** Idea
**Effort:** Medium

Create a dashboard for administrators:

- [ ] User statistics (total users, active users, recent registrations)
- [ ] Activity logs
- [ ] System health monitoring
- [ ] Quick actions

---

## Low Priority / Nice to Have

### Bulk User Operations
**Status:** Idea
**Effort:** Medium

- [ ] Bulk user import (CSV upload)
- [ ] Bulk user actions (activate/deactivate multiple users)
- [ ] User export functionality

### Advanced Search/Filtering
**Status:** Idea
**Effort:** Small

- [ ] Filter users by role, status, verification status
- [ ] Advanced search with multiple criteria
- [ ] Save search filters

### Audit Trail
**Status:** Idea
**Effort:** Medium-Large

- [ ] Track who created/modified user accounts
- [ ] Track permission changes
- [ ] View history of changes

### Two-Factor Authentication
**Status:** Idea
**Effort:** Large

- [ ] TOTP-based 2FA
- [ ] Recovery codes
- [ ] Admin can enforce 2FA for specific users/roles

---

## Completed Features

### Email Verification System ✅
**Completed:** 2025-10-09

- ✅ Token-based email verification
- ✅ Configurable via `REQUIRE_EMAIL_VERIFICATION` env var
- ✅ Auto-verify for superusers and admin-created users
- ✅ Resend verification emails
- ✅ UI adapts based on configuration
- ✅ Force verify checkbox for admins

### User Management Improvements ✅
**Completed:** 2025-10-09

- ✅ Separate `/register` and `/login` routes
- ✅ Prevent self-modification of permissions
- ✅ Backend validation for protected fields
- ✅ Optional first/last name fields
- ✅ Conditional UI based on email verification setting

---

## Notes

- This roadmap is a living document and will be updated as priorities change
- Items are organized by priority, but actual implementation order may vary
- Effort estimates: Small (< 1 day), Medium (1-3 days), Large (> 3 days)
- Status options: Idea, Planned, In Progress, Completed, On Hold
