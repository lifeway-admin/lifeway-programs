# Access Control Policy
## Lifeway Programs, Inc.

**Policy Number:** HIPAA-ACC-001  
**Effective Date:** ____________  
**Last Reviewed:** ____________  
**Approved By:** ____________ (Executive Director)  
**Security Officer:** ____________

---

## 1. Purpose

This policy establishes procedures for controlling access to ePHI in compliance with the HIPAA Security Rule's Access Control standard (45 CFR §164.312(a)) and the Information Access Management standard (45 CFR §164.308(a)(4)). The goal is to ensure that each workforce member has access only to the ePHI necessary to perform their job — no more.

---

## 2. Scope

This policy applies to all workforce members who access, or request access to, the Lifeway CRM, the backend API, the database, or any system that stores or transmits ePHI. It covers all user accounts, credentials, and access levels.

---

## 3. Unique User Identification

Every workforce member who accesses ePHI must have a **unique user account**. Shared accounts are strictly prohibited. Each user is individually accountable for all actions performed under their credentials.

The Security Officer maintains a User Account Registry listing every active account, associated workforce member, role, and date of last review.

---

## 4. Role Definitions and Access Levels

Access to the Lifeway CRM is governed by role-based access control (RBAC). The following roles are defined:

### 4.1 Admin
**Who:** Executive Director, designated IT/Operations lead.  
**Access:** Full system access — all client records, appointment management, staff management, donation records, audit log, reports, user account management, deletions.  
**Notes:** Admin accounts shall be limited to the minimum number of individuals who require this level of access. Admin activity is logged.

### 4.2 Staff
**Who:** Therapists, physicians, social workers, case managers, administrative coordinators, and other clinical or direct-service employees.  
**Access:** Full read and write access to client records, appointments, and donations. Cannot delete client records (admin only). Cannot manage user accounts or view audit log.  
**Notes:** The most common role for regular workforce members.

### 4.3 Readonly
**Who:** Interns, volunteers, board members reviewing reports, external auditors, or any individual who needs to view data but not modify it.  
**Access:** Read-only access to client records and appointments. Cannot create, edit, or delete any records.  
**Notes:** Appropriate for individuals who have a legitimate need to view data but no clinical or operational function that requires write access.

---

## 5. Account Provisioning

### 5.1 New Account Request
Access requests must be submitted in writing to the Security Officer by the requesting individual's supervisor. The request must specify:

- Full name of the workforce member;
- Role/title;
- Requested access level (Admin / Staff / Readonly);
- Justification for the access level requested;
- Start date.

### 5.2 Approval
All new account requests must be approved by:

- **Staff and Readonly accounts:** Direct supervisor + Security Officer;
- **Admin accounts:** Executive Director + Security Officer.

### 5.3 Account Creation
Upon approval, the Security Officer or designated IT administrator shall:

1. Create the account in the Lifeway CRM with the approved role;
2. Generate a temporary initial password following the password policy;
3. Communicate credentials to the workforce member via a secure, direct channel (in-person or encrypted message — never unencrypted email);
4. Require the workforce member to change the password at first login;
5. Log the account creation in the User Account Registry.

### 5.4 HIPAA Training Prerequisite
No new account shall be activated until the workforce member has completed HIPAA training and signed the Workforce Acknowledgment Form.

---

## 6. Account Modification

When a workforce member's role changes (promotion, transfer, position change), their access level must be reviewed and updated within **5 business days**. The supervisor must notify the Security Officer in writing. The Security Officer shall update the account and document the change in the User Account Registry.

---

## 7. Account Termination and Deprovisioning

### 7.1 Termination Protocol
When a workforce member leaves Lifeway Programs (voluntary or involuntary), the following must occur **on or before the last day of employment/engagement**:

| Action | Responsible Party | Timeline |
|---|---|---|
| Notify Security Officer of termination | Supervisor / HR | Immediately upon knowledge of departure |
| Disable CRM account | Security Officer | **Same day as departure** (immediately for involuntary) |
| Revoke VPN or remote access | Security Officer | Same day |
| Collect devices and access badges | Supervisor / HR | Last day |
| Retrieve or disable any shared credentials | Security Officer | Same day |
| Verify no active sessions | Security Officer | Same day |

**For involuntary terminations:** Access shall be revoked at the time of or immediately prior to notification to the workforce member to prevent retaliatory access.

### 7.2 Contractor and Volunteer Termination
The same protocol applies to contractors, volunteers, and interns upon conclusion of their engagement with Lifeway Programs.

### 7.3 Documentation
Account terminations shall be documented in the User Account Registry with the date and reason for deprovisioning.

---

## 8. Password Requirements

All CRM user passwords must meet the following minimum standards:

| Requirement | Standard |
|---|---|
| Minimum length | 10 characters |
| Uppercase letters | At least 1 |
| Lowercase letters | At least 1 |
| Numbers | At least 1 |
| Special characters | Recommended but not required |
| Password reuse | May not reuse immediately previous password |
| Sharing | Strictly prohibited |
| Written down | Not permitted near workstations |

Passwords must be changed immediately if there is any reason to believe they have been compromised. The CRM enforces password strength requirements at the time of change.

---

## 9. Multi-Factor Authentication (MFA)

MFA shall be implemented for CRM access as soon as technically feasible. Until MFA is implemented, compensating controls include rate-limited login attempts and automatic session expiry after 8 hours.

**Target implementation date for MFA:** ____________

---

## 10. Privileged Access — Admin Accounts

Admin accounts carry the highest level of access and must be managed with additional care:

- Admin accounts shall only be used for tasks that require admin-level access;
- Admin users should maintain a separate Staff-level account for routine daily use;
- All Admin actions are captured in the audit log and reviewed monthly by the Security Officer;
- Admin credentials must be changed immediately upon any suspected compromise.

---

## 11. Quarterly Access Reviews

The Security Officer shall conduct a quarterly access review to verify that:

- Every active account corresponds to a current workforce member;
- Each workforce member's access level remains appropriate for their current role;
- No accounts remain active for former workforce members.

The results of each quarterly review shall be documented and filed. Any discrepancies shall be remediated within 5 business days of discovery.

**Review Schedule:**
- Q1: January
- Q2: April
- Q3: July
- Q4: October

---

## 12. Audit Log Review

The Security Officer shall review CRM audit logs **monthly** for:

- Unusual patterns of access (e.g., large numbers of records accessed in a short period);
- Access to records outside a user's expected patient population;
- Login attempts from unexpected IP addresses or times;
- Admin-level actions that were not authorized.

Any anomalies shall be investigated per the Breach Notification Policy and Security Policy.

---

## 13. Emergency Access

In an emergency situation where a regular user's credentials are unavailable and patient safety requires access to ePHI, the Security Officer may grant temporary access using an emergency access account. Emergency access must be:

- Authorized by the Executive Director or Security Officer;
- Documented immediately (reason, person granted access, time, records accessed);
- Revoked as soon as the emergency is resolved;
- Reviewed at the next access review cycle.

---

## 14. Remote Access

Workforce members accessing the CRM remotely must:

- Use a secure, encrypted connection (VPN or HTTPS only);
- Not access PHI from public computers, shared devices, or unmanaged personal devices;
- Ensure their home or remote network is secured (password-protected Wi-Fi, current router firmware).

---

## 15. Policy Review

This policy shall be reviewed at least annually and updated as needed.

---

## User Account Registry

*Maintained by Security Officer — retained for 6 years*

| Username | Full Name | Role | Department | Date Created | Date Last Modified | Status | Date Deprovisioned |
|---|---|---|---|---|---|---|---|
| | | | | | | Active / Inactive | |

---

**Security Officer Signature:** _____________________________ **Date:** __________

**Executive Director Signature:** _________________________ **Date:** __________
