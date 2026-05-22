import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from auth import get_current_user

router = APIRouter(prefix="/docs", tags=["docs"])

_BASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "..")
DOCS_DIR = os.path.normpath(os.path.join(_BASE, "docs", "hipaa"))
FORMS_DIR = os.path.normpath(os.path.join(_BASE, "docs", "patient-forms"))

POLICY_METADATA = [
    {"filename": "01_notice_of_privacy_practices.md", "title": "Notice of Privacy Practices", "category": "Required by Law", "description": "Patient-facing document explaining HIPAA rights and how PHI is used. Must be given to every patient at intake."},
    {"filename": "02_privacy_policy.md", "title": "HIPAA Privacy Policy", "category": "Required by Law", "description": "Internal policy governing how workforce members handle PHI — access, disclosure, and patient rights procedures."},
    {"filename": "03_security_policy.md", "title": "HIPAA Security Policy", "category": "Required by Law", "description": "Administrative, physical, and technical safeguards for protecting electronic PHI. Covers passwords, access, encryption, and devices."},
    {"filename": "04_risk_analysis.md", "title": "Risk Analysis", "category": "Required by Law", "description": "Documented assessment of threats and vulnerabilities to ePHI, with risk ratings and a remediation plan. Required annually by the Security Rule."},
    {"filename": "05_breach_notification_policy.md", "title": "Breach Notification Policy", "category": "Required by Law", "description": "Step-by-step procedures for identifying, assessing, and reporting breaches of unsecured PHI to patients and HHS within 60 days."},
    {"filename": "06_workforce_training_policy.md", "title": "Workforce Training Policy & Acknowledgment", "category": "Required by Law", "description": "Training requirements for all workforce members, including the sign-off acknowledgment form each member must complete."},
    {"filename": "07_sanction_policy.md", "title": "Sanction Policy", "category": "Required by Law", "description": "Consequences for HIPAA violations — from verbal counseling to termination and criminal referral — applied by violation category."},
    {"filename": "08_data_retention_disposal_policy.md", "title": "Data Retention & Disposal Policy", "category": "Strongly Recommended", "description": "How long records are kept (7 years for adult patient records under Florida law) and how they are securely destroyed."},
    {"filename": "09_business_associate_agreement_template.md", "title": "Business Associate Agreement Template", "category": "Strongly Recommended", "description": "Template BAA to execute with any vendor that creates, receives, maintains, or transmits PHI on behalf of Lifeway Programs."},
    {"filename": "10_contingency_disaster_recovery_plan.md", "title": "Contingency & Disaster Recovery Plan", "category": "Strongly Recommended", "description": "Backup schedule, disaster recovery steps, emergency mode operations, and testing procedures for system failures."},
    {"filename": "11_access_control_policy.md", "title": "Access Control Policy", "category": "Strongly Recommended", "description": "Account provisioning/deprovisioning procedures, role definitions, password requirements, and quarterly access review schedule."},
]


PATIENT_FORMS_METADATA = [
    {"filename": "01_consent_for_treatment.md", "title": "Consent for Treatment", "category": "Patient Forms", "description": "General consent authorizing services, explaining confidentiality limits, communication preferences, and patient rights. Required for all patients at intake."},
    {"filename": "02_financial_responsibility_agreement.md", "title": "Financial Responsibility Agreement", "category": "Patient Forms", "description": "Covers fees, sliding scale eligibility, insurance authorization, accepted payment methods, outstanding balance policy, and cancellation/no-show fees."},
    {"filename": "03_release_of_information.md", "title": "Authorization for Release of Health Information", "category": "Patient Forms", "description": "HIPAA §164.508-compliant form authorizing disclosure or receipt of PHI. Includes purpose, format, expiration, and right to revoke."},
    {"filename": "04_telehealth_consent.md", "title": "Telehealth Informed Consent", "category": "Patient Forms", "description": "Informs patients of telehealth benefits, risks, technology requirements, emergency safety plan, and confidentiality obligations. Required before any remote session."},
    {"filename": "05_minor_consent_guardian_authorization.md", "title": "Minor Consent & Guardian Authorization", "category": "Patient Forms", "description": "Required when patient is under 18. Covers FL §394.4784 minor consent rights, guardian legal authority, treatment consent, medication authorization, and minor assent."},
]


def _read_doc(directory: str, filename: str) -> str:
    if not filename.endswith(".md") or "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = os.path.join(directory, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Document not found")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


@router.get("/")
def list_policies(_=Depends(get_current_user)):
    return POLICY_METADATA


@router.get("/forms/")
def list_patient_forms(_=Depends(get_current_user)):
    return PATIENT_FORMS_METADATA


@router.get("/forms/{filename}", response_class=PlainTextResponse)
def get_patient_form(filename: str, _=Depends(get_current_user)):
    return _read_doc(FORMS_DIR, filename)


@router.get("/{filename}", response_class=PlainTextResponse)
def get_policy(filename: str, _=Depends(get_current_user)):
    return _read_doc(DOCS_DIR, filename)
