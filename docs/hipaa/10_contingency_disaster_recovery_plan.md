# Contingency Plan and Disaster Recovery Procedures
## Lifeway Programs, Inc.

**Policy Number:** HIPAA-CON-001  
**Effective Date:** ____________  
**Last Reviewed:** ____________  
**Approved By:** ____________ (Executive Director)  
**Plan Owner:** ____________ (Security Officer)

---

## 1. Purpose

The HIPAA Security Rule (45 CFR §164.308(a)(7)) requires covered entities to establish and implement policies and procedures for responding to emergencies or other occurrences that damage systems containing ePHI. This plan addresses data backup, disaster recovery, emergency mode operations, and testing procedures for Lifeway Programs, Inc.

---

## 2. Scope

This plan covers all systems that create, maintain, or transmit ePHI:

- Lifeway CRM (FastAPI backend, React frontend, SQLite/PostgreSQL database)
- Public patient booking platform
- Email communications
- Staff workstations

---

## 3. Data Criticality Analysis

| System | Criticality | Impact of Loss | RPO* | RTO** |
|---|---|---|---|---|
| CRM database (clients, appointments) | **Critical** | Patient care disrupted; billing halted | 24 hours | 4 hours |
| CRM backend API | **Critical** | Full system unavailable | 24 hours | 4 hours |
| Public booking platform | **High** | New patients cannot self-schedule | 24 hours | 8 hours |
| Staff email | **Medium** | Communication disrupted | 24 hours | 24 hours |
| Staff workstations | **Medium** | Individual productivity disrupted | 48 hours | 48 hours |

*RPO = Recovery Point Objective (maximum acceptable data loss measured in time)  
**RTO = Recovery Time Objective (maximum acceptable downtime)

---

## 4. Data Backup Plan

### 4.1 Backup Schedule

| Data | Frequency | Method | Storage Location |
|---|---|---|---|
| CRM database (full) | Daily | Automated snapshot | Encrypted off-site cloud storage |
| CRM database (incremental) | Hourly (when in production) | Transaction log | Same encrypted cloud storage |
| Application code | On every deployment | Git repository | GitHub (private repository) |
| Configuration files | On change | Encrypted backup | Encrypted off-site cloud storage |
| Staff documents | Weekly | Encrypted backup | Encrypted off-site cloud storage |

### 4.2 Backup Requirements

- All backups of PHI must be **encrypted at rest** using AES-256 or equivalent;
- Backup media must be stored in a geographically separate location from the primary system;
- Backups must not be accessible to unauthorized individuals;
- The backup service/platform must have a signed BAA with Lifeway Programs.

### 4.3 Backup Verification and Testing

- The Security Officer shall verify that automated backups completed successfully **weekly** (review backup logs);
- A **full test restore** shall be performed **quarterly** to verify that backups are valid and restorable;
- Test restore results shall be documented in the Contingency Plan Test Log (Section 9);
- Any backup failure shall be investigated and remediated within 24 hours.

---

## 5. Disaster Recovery Procedure

### 5.1 Declaration of Disaster

A disaster shall be declared by the Executive Director or Security Officer when:

- The primary system is unavailable and cannot be restored within the RTO; or
- Data has been corrupted, deleted, or encrypted (e.g., ransomware); or
- The primary hosting facility is unavailable due to physical damage or prolonged outage.

### 5.2 Recovery Steps — CRM System

**Step 1 — Assess and isolate**
- Determine the scope of the failure (hardware, software, data, network);
- Isolate affected systems to prevent further damage;
- Notify the Security Officer and Executive Director.

**Step 2 — Activate recovery**
- If hosting failure: provision a new server instance in the cloud (AWS/GCP/Azure);
- Restore application code from the Git repository;
- Restore the most recent validated database backup;
- Re-configure environment variables (from secure, encrypted storage).

**Step 3 — Validate**
- Verify data integrity by spot-checking recent client records and appointments;
- Run application health checks;
- Confirm HTTPS/TLS is operational before accepting patient data.

**Step 4 — Resume operations**
- Notify staff of system restoration;
- Document any data loss and assess whether a HIPAA breach notification is required (see Breach Notification Policy).

**Step 5 — Post-recovery review**
- Conduct root-cause analysis within 5 business days;
- Update this plan if gaps were identified;
- Document findings in the Contingency Plan Test Log.

---

## 6. Emergency Mode Operations

In the event of extended system unavailability, Lifeway Programs shall operate in emergency mode:

| Function | Emergency Mode Procedure |
|---|---|
| Patient scheduling | Use paper appointment log stored in locked office; enter into CRM when restored |
| Patient intake | Use paper intake forms; scan and upload to CRM when restored |
| Staff communication | Direct phone calls; backup contact list maintained by admin |
| Billing | Defer non-urgent billing; document services on paper |
| Clinical notes | Document on paper; transfer to CRM when restored |

Paper records created during emergency mode shall be treated as PHI, stored securely, and transferred to the CRM as soon as the system is restored. All paper records shall then be retained or disposed of per the Data Retention and Disposal Policy.

---

## 7. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| Executive Director | Declares disaster; authorizes expenditures for recovery |
| Security Officer | Leads technical recovery; coordinates with hosting provider; communicates status |
| Privacy Officer | Assesses breach notification obligations; communicates with patients if needed |
| Administrative Staff | Activates paper-based emergency operations; notifies scheduled patients |
| Clinical Staff | Documents services on paper; maintains continuity of patient care |

### Emergency Contact List

| Name | Role | Phone | Email |
|---|---|---|---|
| ____________ | Executive Director | | |
| ____________ | Security Officer | | |
| ____________ | Privacy Officer | | |
| ____________ | Hosting Provider Support | | |
| ____________ | IT Support | | |

---

## 8. Critical System Credentials

Critical credentials (hosting provider login, database credentials, API keys, backup encryption keys) shall be stored in an encrypted password manager accessible to the Security Officer and Executive Director. A printed emergency copy shall be stored in a locked safe on premises. Credentials shall be rotated after any actual or suspected compromise.

---

## 9. Contingency Plan Test Log

| Test Date | Type of Test | Systems Tested | Result | Data Loss (if any) | Issues Found | Resolved By | Sign-Off |
|---|---|---|---|---|---|---|---|
| | Backup verification | | | | | | |
| | Full restore test | | | | | | |
| | Tabletop exercise | | | | | | |

---

## 10. Plan Maintenance

This plan shall be:

- Reviewed and updated at least **annually**;
- Reviewed after any actual disaster, significant near-miss, or material change to systems;
- Tested with a full restore exercise at least **quarterly**;
- Tested with a tabletop exercise involving all key staff **annually**.

---

**Security Officer Signature:** _____________________________ **Date:** __________

**Executive Director Signature:** _________________________ **Date:** __________
