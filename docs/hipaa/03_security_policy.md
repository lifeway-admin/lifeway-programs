# HIPAA Security Policy
## Lifeway Programs, Inc.

**Policy Number:** HIPAA-SEC-001  
**Effective Date:** ____________  
**Last Reviewed:** ____________  
**Approved By:** ____________ (Executive Director)  
**Security Officer:** ____________

---

## 1. Purpose

This policy establishes administrative, physical, and technical safeguards to protect electronic Protected Health Information (ePHI) in compliance with the HIPAA Security Rule (45 CFR Part 164, Subparts A and C). It applies to all systems that create, receive, maintain, or transmit ePHI on behalf of Lifeway Programs, Inc.

---

## 2. Scope

This policy applies to:

- All workforce members (employees, contractors, volunteers) of Lifeway Programs;
- All electronic systems, devices, and software used to access or process ePHI, including the Lifeway CRM, the public booking platform, the backend API server, and any personal devices used to access work systems;
- All networks and communication channels used to transmit ePHI.

---

## 3. Security Officer

Lifeway Programs shall designate a Security Officer responsible for:

- Developing, implementing, and updating security policies and procedures;
- Conducting or overseeing annual risk analyses;
- Managing security incident response;
- Evaluating and implementing security technologies;
- Ensuring workforce compliance with security requirements.

---

## 4. Administrative Safeguards

### 4.1 Risk Analysis and Risk Management
Lifeway Programs shall conduct a comprehensive risk analysis at least annually and whenever there is a significant change to the environment (new system, change in vendor, breach). The risk analysis shall identify threats and vulnerabilities to ePHI, assess current controls, determine likelihood and impact, and document risk management actions. See the Risk Analysis document for the current assessment.

### 4.2 Workforce Clearance
Before granting access to ePHI, all workforce members shall:

- Complete background screening appropriate to their role;
- Complete HIPAA training;
- Sign a Confidentiality Agreement and Acceptable Use Agreement.

### 4.3 Workforce Training
All workforce members with access to ePHI shall complete security awareness training at hire and annually. Training shall include: phishing awareness, password hygiene, device security, incident reporting, and consequences of non-compliance.

### 4.4 Sanctions
Violations of this security policy shall result in sanctions as described in the Sanction Policy. Sanctions shall be applied consistently and documented.

### 4.5 Information Access Management
Access to ePHI shall be granted on a need-to-know, minimum-necessary basis. The following role-based access levels are enforced in the Lifeway CRM:

| Role | Access Level |
|---|---|
| Admin | Full access — all records, staff management, audit log, deletions |
| Staff | Read/write access to client records, appointments, donations |
| Readonly | Read-only access — cannot create, edit, or delete any records |

Access is controlled by the CRM's role-based authentication system. Role assignments are reviewed quarterly by the Security Officer.

### 4.6 Security Incident Procedures
Any suspected or confirmed security incident involving ePHI shall be:

1. Reported immediately to the Security Officer;
2. Documented in an incident log;
3. Investigated per the Breach Notification Policy if PHI is involved;
4. Mitigated as quickly as possible.

### 4.7 Contingency Plan
Lifeway Programs maintains a Contingency Plan addressing data backup, disaster recovery, and emergency operations. See the Contingency / Disaster Recovery Plan document.

### 4.8 Evaluation
The Security Officer shall evaluate the security program at least annually and after significant security events. Evaluation findings shall be documented.

---

## 5. Physical Safeguards

### 5.1 Facility Access Controls
Areas where ePHI is processed or stored shall be physically secured:

- Administrative offices shall be locked when unoccupied;
- Servers and network equipment shall be in a locked room or cabinet;
- Visitors shall not be allowed unescorted in areas where ePHI is visible or accessible.

### 5.2 Workstation Use
Workforce members shall:

- Lock or log out of their workstation whenever leaving it unattended, even briefly;
- Position screens so they cannot be viewed by unauthorized individuals (patients in waiting rooms, visitors);
- Not write passwords on paper stored near workstations.

### 5.3 Workstation Security
Workstations used to access ePHI shall:

- Have automatic screen lock configured to activate after 5 minutes of inactivity;
- Have current, supported operating system software with security updates applied;
- Have reputable endpoint protection (antivirus/anti-malware) installed and current.

### 5.4 Device and Media Controls
- Portable devices (laptops, tablets, phones) that contain or can access ePHI shall be encrypted using full-disk encryption;
- Removable media (USB drives) containing ePHI shall be encrypted;
- Before disposing of any device, storage media shall be securely wiped using NIST SP 800-88 approved methods or physically destroyed;
- A log of hardware disposals shall be maintained by the Security Officer.

---

## 6. Technical Safeguards

### 6.1 Unique User Identification
Every workforce member shall have a unique login credential. Shared accounts are prohibited. Login credentials shall not be transferred between individuals.

### 6.2 Automatic Session Timeout
- CRM sessions shall automatically expire after 8 hours of token validity. The system displays warning alerts at 10 minutes and 2 minutes remaining.
- Workstation screen locks shall activate after 5 minutes.

### 6.3 Passwords
All passwords for CRM accounts shall meet the following requirements:

- Minimum 10 characters;
- At least one uppercase letter, one lowercase letter, and one number;
- Not reused from the previous password;
- Changed immediately if suspected compromise.

Default system passwords (including the admin account) shall be changed before the system is used for real patient data.

### 6.4 Audit Controls
The Lifeway CRM maintains an audit log of all data access and modifications including:

- User login events;
- Individual client record views (who accessed, when, their role);
- Create, update, and delete operations on all PHI;
- Appointment scheduling and modifications.

Audit logs shall be reviewed by the Security Officer at least monthly and retained for six (6) years.

### 6.5 Encryption in Transit
All ePHI transmitted over public networks shall be encrypted using TLS 1.2 or higher (HTTPS). The CRM and public booking application shall be accessible only over HTTPS in production. HTTP connections shall be redirected to HTTPS.

### 6.6 Encryption at Rest
In production:

- The database shall be hosted on a HIPAA-eligible platform with encryption at rest enabled;
- Backups shall be encrypted;
- SQLite shall not be used for production PHI storage.

### 6.7 Integrity Controls
- Database backups shall be performed daily and tested quarterly;
- File integrity shall be maintained by using version-controlled application code;
- API responses include no-cache headers for PHI to prevent unauthorized storage in browser caches.

### 6.8 Transmission Security
- All API communications use HTTPS/TLS;
- PHI shall not be transmitted via unencrypted email;
- If PHI must be communicated by email, a HIPAA-compliant encrypted email service shall be used.

### 6.9 API Security
- Login endpoints are rate-limited to 10 attempts per minute per IP address;
- Public booking endpoints are rate-limited to 20 bookings per hour per IP;
- Patient self-service lookup requires email plus date of birth for verification;
- All API responses that contain PHI include Cache-Control: no-store headers.

---

## 7. Third-Party and Cloud Services

Any cloud service, SaaS product, or third-party vendor that stores or processes ePHI must:

- Sign a Business Associate Agreement with Lifeway Programs before accessing PHI;
- Be assessed for HIPAA compliance capability before use;
- Demonstrate data encryption at rest and in transit.

The production hosting provider shall be HIPAA-eligible (e.g., AWS, Google Cloud, or Azure with a signed BAA).

---

## 8. Remote Access

Workforce members accessing the CRM remotely shall:

- Connect only over trusted, secured networks or use a VPN;
- Use devices that meet the workstation security requirements in Section 5;
- Not access PHI from public computers or unmanaged devices.

---

## 9. Incident Response

See the Breach Notification Policy for full breach response procedures. Upon discovery of any potential security incident:

1. Report to the Security Officer immediately;
2. Do not attempt to remediate without Security Officer direction;
3. Preserve evidence (do not wipe logs or devices);
4. Document the timeline and affected data.

---

## 10. Policy Review

This policy shall be reviewed at least annually and updated when significant changes occur to systems, laws, or organizational structure.

---

**Security Officer Signature:** ____________________________ **Date:** __________

**Executive Director Signature:** _________________________ **Date:** __________
