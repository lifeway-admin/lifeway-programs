import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Lifeway Programs")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)

_PINK = "#e91e8c"
_FOOTER = "Lifeway Programs, Inc. · lifewayprograms.org · jeffrey.tjok@proton.me"


def _header(title: str, subtitle: str = "") -> str:
    sub = f'<p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px;">{subtitle}</p>' if subtitle else ""
    return f"""
    <div style="background:{_PINK};padding:24px 32px;border-radius:12px 12px 0 0;">
      <h1 style="color:white;margin:0;font-size:22px;">{title}</h1>{sub}
    </div>"""


def _wrap(inner: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
      <div style="background:white;padding:32px;border:1px solid #f3f4f6;border-top:none;border-radius:0 0 12px 12px;">
        {inner}
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;"/>
        <p style="font-size:12px;color:#9ca3af;margin:0;">{_FOOTER}</p>
      </div>
    </div>"""


def _send(to: str, subject: str, html: str, attachment_bytes: bytes = None, attachment_filename: str = None):
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        return  # Silently skip — not configured

    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    msg["To"] = to

    alt = MIMEMultipart("alternative")
    alt.attach(MIMEText(html, "html"))
    msg.attach(alt)

    if attachment_bytes and attachment_filename:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment_bytes)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{attachment_filename}"')
        msg.attach(part)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to, msg.as_string())
    except Exception:
        pass  # Errors suppressed — do not log PHI (recipient address)


def send_booking_confirmation(*, to_email: str, patient_name: str, confirmation_number: str,
                               appointment_datetime: str, service: str, provider: str,
                               zoom_join_url: str = None):
    subject = f"Appointment Confirmed — {confirmation_number} | Lifeway Programs"
    body = f"""
    <p style="font-size:16px;">Hi {patient_name},</p>
    <p style="color:#6b7280;">Your appointment has been confirmed. Here are your details:</p>

    <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#9ca3af;letter-spacing:1px;">Confirmation Number</p>
      <p style="margin:0;font-size:26px;font-weight:bold;color:{_PINK};letter-spacing:4px;">{confirmation_number}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Date &amp; Time</td>
          <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">{appointment_datetime}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Service</td>
          <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">{service}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Provider</td>
          <td style="padding:8px 0;font-weight:600;text-align:right;">{provider}</td></tr>
    </table>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        <strong>Important:</strong> Please arrive 15 minutes early for your first visit to complete intake paperwork.
        To cancel or reschedule, please give us at least 24 hours' notice.
      </p>
    </div>

    {f'''
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#166534;">Telehealth Appointment</p>
      <p style="margin:0 0 8px;font-size:13px;color:#166534;">Join your session using the secure link below:</p>
      <a href="{zoom_join_url}" style="
        display:inline-block;background:#059669;color:white;text-decoration:none;
        padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">
        Join Zoom Meeting →
      </a>
      <p style="margin:8px 0 0;font-size:11px;color:#6b7280;">{zoom_join_url}</p>
    </div>''' if zoom_join_url else ''}

    <p style="font-size:13px;color:#6b7280;">
      Visit <a href="https://lifewayprograms.org" style="color:{_PINK};">lifewayprograms.org</a> or call our office to manage your appointment.
    </p>"""
    html = _header("Appointment Confirmed", "Lifeway Programs, Inc.") + _wrap(body)
    _send(to_email, subject, html)


def send_appointment_reminder(*, to_email: str, patient_name: str, confirmation_number: str,
                               appointment_datetime: str, service: str, provider: str):
    subject = "Reminder: Your appointment tomorrow — Lifeway Programs"
    body = f"""
    <p style="font-size:16px;">Hi {patient_name},</p>
    <p style="color:#6b7280;">This is a friendly reminder that you have an appointment tomorrow at Lifeway Programs.</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;">
      <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Confirmation #</td>
          <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">{confirmation_number}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Date &amp; Time</td>
          <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">{appointment_datetime}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Service</td>
          <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">{service}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Provider</td>
          <td style="padding:8px 0;font-weight:600;text-align:right;">{provider}</td></tr>
    </table>

    <p style="font-size:13px;color:#6b7280;">
      Need to cancel? Please let us know at least 24 hours in advance at
      <a href="https://lifewayprograms.org" style="color:{_PINK};">lifewayprograms.org</a> or by calling our office.
    </p>"""
    html = _header("Appointment Reminder", "You have an appointment tomorrow") + _wrap(body)
    _send(to_email, subject, html)


def send_staff_invite(*, to_email: str, invited_by: str, role: str, invite_url: str):
    role_label = role.replace("_", " ").title()
    subject = f"You've been invited to join Lifeway Programs CRM"
    body = f"""
    <p style="font-size:16px;">You've been invited!</p>
    <p style="color:#6b7280;">
      <strong>{invited_by}</strong> has invited you to join the Lifeway Programs staff portal
      as a <strong>{role_label}</strong>.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="{invite_url}" style="
        background:{_PINK};color:white;text-decoration:none;
        padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;
        display:inline-block;">
        Accept Invitation &amp; Set Up Account
      </a>
    </div>

    <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#9d174d;">
        This invitation expires in <strong>48 hours</strong>. If you did not expect this invitation,
        you can safely ignore this email.
      </p>
    </div>

    <p style="font-size:13px;color:#6b7280;">
      Having trouble with the button? Copy this link into your browser:<br/>
      <a href="{invite_url}" style="color:{_PINK};word-break:break-all;">{invite_url}</a>
    </p>"""
    html = _header("Staff Invitation", "Lifeway Programs CRM") + _wrap(body)
    _send(to_email, subject, html)


def send_payment_request_email(*, to_email: str, client_name: str, amount_str: str,
                               description: str, checkout_url: str):
    subject = f"Payment Request — {amount_str} | Lifeway Programs"
    body = f"""
    <p style="font-size:16px;">Hi {client_name},</p>
    <p style="color:#6b7280;">
      Lifeway Programs has sent you a payment request. Please use the secure link below to complete your payment.
    </p>

    <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#9ca3af;letter-spacing:1px;">Amount Due</p>
      <p style="margin:0 0 8px;font-size:30px;font-weight:bold;color:{_PINK};">{amount_str}</p>
      <p style="margin:0;font-size:13px;color:#6b7280;">{description}</p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="{checkout_url}" style="
        background:{_PINK};color:white;text-decoration:none;
        padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;
        display:inline-block;">
        Pay Securely Now →
      </a>
    </div>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#6b7280;">
        This payment is processed securely through Stripe. Your card information is never stored by Lifeway Programs.
        If you have questions, please contact us at
        <a href="mailto:jeffrey.tjok@proton.me" style="color:{_PINK};">jeffrey.tjok@proton.me</a>.
      </p>
    </div>

    <p style="font-size:12px;color:#9ca3af;">
      If the button above does not work, copy this link into your browser:<br/>
      <a href="{checkout_url}" style="color:{_PINK};word-break:break-all;">{checkout_url}</a>
    </p>"""
    html = _header("Payment Request", "Lifeway Programs, Inc.") + _wrap(body)
    _send(to_email, subject, html)


def send_signed_forms_receipt(*, to_email: str, patient_name: str, signed_forms: list, signed_at: str,
                               pdf_bytes: bytes = None):
    rows = "\n".join(
        f'<tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">{f["form_title"]}</td>'
        f'<td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;color:#059669;">✓ Signed</td></tr>'
        for f in signed_forms
    )
    subject = "Your signed intake forms — Lifeway Programs"
    body = f"""
    <p style="font-size:16px;">Hi {patient_name},</p>
    <p style="color:#6b7280;">The following intake forms have been electronically signed and received by Lifeway Programs.</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;">{rows}</table>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#166534;">
        <strong>Signed on:</strong> {signed_at}<br/>
        Your electronic signature has the same legal effect as a handwritten signature under the Electronic
        Signatures in Global and National Commerce Act (E-SIGN) and Florida's Electronic Signature Act.
      </p>
    </div>

    <p style="font-size:13px;color:#6b7280;">
      To request a copy of any signed form or to revoke consent, contact us at
      <a href="mailto:jeffrey.tjok@proton.me" style="color:{_PINK};">jeffrey.tjok@proton.me</a>.
    </p>"""
    html = _header("Intake Forms Signed", "Keep this email for your records") + _wrap(body)
    _send(to_email, subject, html,
          attachment_bytes=pdf_bytes if pdf_bytes else None,
          attachment_filename="lifeway_signed_forms.pdf" if pdf_bytes else None)
