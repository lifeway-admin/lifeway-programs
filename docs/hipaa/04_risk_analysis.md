# HIPAA Risk Analysis
## Lifeway Programs, Inc.

**Document Version:** 1.0  
**Date Completed:** ____________  
**Conducted By:** ____________  
**Next Review Due:** ____________ (annually or upon significant change)

---

## 1. Purpose

The HIPAA Security Rule (45 CFR §164.308(a)(1)) requires covered entities to conduct an accurate and thorough assessment of potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic Protected Health Information (ePHI). This document is that assessment for Lifeway Programs, Inc.

---

## 2. Scope

This risk analysis covers all systems, locations, and processes involved in the creation, receipt, maintenance, and transmission of ePHI at Lifeway Programs, including:

- Lifeway CRM (backend API, frontend web application, database)
- Public patient booking platform
- Staff workstations and personal devices used for work
- Email communications
- Network infrastructure

---

## 3. Inventory of ePHI

| Data Type | Location | Format |
|---|---|---|
| Client name, contact information | CRM database | Electronic |
| Date of birth | CRM database / booking form | Electronic |
| Insurance information | CRM database / booking form | Electronic |
| Appointment records | CRM database | Electronic |
| Clinical notes | CRM database (Notes field) | Electronic |
| Diagnosis / service type | CRM database | Electronic |
| Confirmation numbers | CRM database | Electronic |
| Signed consent forms (signature only) | CRM booking platform (not stored) | Not retained |

---

## 4. Threat and Vulnerability Assessment

### 4.1 Risk Rating Key

| Likelihood | Impact | Risk Level |
|---|---|---|
| High + High | = | **Critical** |
| High + Medium | = | **High** |
| Medium + High | = | **High** |
| Medium + Medium | = | **Medium** |
| Low + Any | = | **Low–Medium** |

---

### 4.2 Risk Register

| # | Threat | Vulnerability | Likelihood | Impact | Risk | Current Controls | Residual Risk | Remediation |
|---|---|---|---|---|---|---|---|---|
| R-01 | Unauthorized login (brute force) | Password-based auth, public-facing login | Medium | High | **High** | Rate limiting (10/min), JWT expiry 8hr | Medium | Implement MFA; alert on repeated failures |
| R-02 | Weak or default credentials | Admin account ships with default password | High | Critical | **Critical** | CLAUDE.md flags this; instructions provided | High | **Must change before first production use** |
| R-03 | PHI exposed in transit | Unencrypted HTTP | High | High | **Critical** | HTTPS enforced in production plan; HSTS header added | Low (post-deploy) | Deploy only behind TLS; verify before go-live |
| R-04 | PHI exposed at rest (database) | SQLite plaintext file in dev | Medium | High | **High** | Dev-only; production requires encrypted PostgreSQL | Medium | Migrate to encrypted PostgreSQL before storing real PHI |
| R-05 | Unauthorized internal access | All users could previously read/write all data | Medium | High | **High** | RBAC implemented (admin/staff/readonly roles) | Low | Quarterly access reviews |
| R-06 | PHI cached by browser | API responses cached by browser or proxy | Medium | Medium | **Medium** | no-store Cache-Control headers on PHI endpoints | Low | Monitor; verify in browser dev tools |
| R-07 | Returning patient pre-fill abuse | Public endpoint accepts email to retrieve PHI | High | Medium | **High** | Rate limiting; requires email + DOB | Medium | Monitor logs; consider CAPTCHA |
| R-08 | PHI in server/application logs | Sensitive fields may appear in debug logs | Medium | High | **High** | No explicit log sanitization | **High** | Implement log filtering; disable debug logging in prod |
| R-09 | Malicious insider | Staff with CRM access accesses records without need | Low | High | **Medium** | RBAC; audit log of every PHI record view | Low | Review audit logs monthly |
| R-10 | Third-party vendor breach | Hosting provider compromised | Low | High | **Medium** | Choose HIPAA-eligible host with BAA | Low | Verify BAA; monitor vendor security advisories |
| R-11 | Phishing / credential theft | Staff clicks malicious link and credentials stolen | Medium | High | **High** | Annual training | Medium | MFA; security awareness training |
| R-12 | Lost or stolen device | Staff laptop/phone with ePHI stolen | Medium | High | **High** | Policy requires full-disk encryption | Medium | Enforce encryption; MDM for managed devices |
| R-13 | Data loss / no backup | Database lost without recovery option | Low | Critical | **High** | Documented backup plan | Medium | Test restore quarterly; off-site backup |
| R-14 | Unauthorized physical access | Intruder accesses workstation with active session | Low | High | **Medium** | Screen lock policy; 5-min auto-lock | Low | Physical access controls |
| R-15 | SQL injection / API attacks | Malicious input manipulates database | Low | Critical | **High** | FastAPI/SQLAlchemy ORM parameterized queries | Low | Penetration test annually |
| R-16 | Expired JWT token still accepted | No server-side token revocation | Medium | Medium | **Medium** | 8-hour expiry; logout clears client token | Medium | Implement token blocklist for forced logout |
| R-17 | Consent records not retained | Signed consent signature not stored server-side | Medium | Medium | **Medium** | Signature collected but only confirmation stored | Medium | Log signature text and timestamp per booking |
| R-18 | Public intake form spam / junk data | No CAPTCHA on public intake form | Medium | Low | **Low** | Rate limiting | Low | Add CAPTCHA if abuse observed |

---

## 5. Priority Remediation Plan

### Critical / Must Fix Before Going Live with Real Patients

| Risk | Action | Owner | Target Date |
|---|---|---|---|
| R-02 | Change default admin password | Admin | Before first login |
| R-03 | Deploy behind HTTPS/TLS; verify no HTTP access | DevOps | Before launch |
| R-04 | Migrate to encrypted PostgreSQL | DevOps | Before launch |

### High Priority — Address Within 30 Days of Launch

| Risk | Action | Owner | Target Date |
|---|---|---|---|
| R-01 | Implement multi-factor authentication | Dev | 30 days post-launch |
| R-08 | Implement log sanitization; disable debug mode | Dev | Before launch |
| R-11 | Mandatory phishing awareness training | Privacy Officer | 30 days |
| R-12 | Enforce full-disk encryption on all devices | IT/Admin | 30 days |
| R-13 | Automated daily backups to off-site encrypted storage; test restore | DevOps | Launch |
| R-16 | Implement server-side token blocklist | Dev | 60 days |
| R-17 | Store consent signature + timestamp in database | Dev | 30 days |

### Medium Priority — Address Within 90 Days

| Risk | Action | Owner | Target Date |
|---|---|---|---|
| R-07 | Add CAPTCHA to returning patient lookup if abuse detected | Dev | As needed |
| R-05 | Quarterly access reviews | Privacy Officer | Quarterly |
| R-09 | Monthly audit log review | Privacy Officer | Monthly |

---

## 6. Certification

I certify that this risk analysis was conducted in good faith and accurately reflects the current risk environment of Lifeway Programs, Inc.

**Conducted By:** _____________________________ **Date:** __________

**Title:** _____________________________

**Reviewed By (Executive Director):** _____________________________ **Date:** __________

---

*This document is to be reviewed and updated at least annually, and immediately following any significant change to systems, operations, or after a security incident or breach.*
