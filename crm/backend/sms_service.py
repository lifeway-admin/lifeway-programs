import os
import json

OPENPHONE_API_KEY = os.getenv("OPENPHONE_API_KEY", "")
OPENPHONE_PHONE_NUMBER_ID = os.getenv("OPENPHONE_PHONE_NUMBER_ID", "")


def _send_sms(to: str, body: str):
    if not OPENPHONE_API_KEY or not OPENPHONE_PHONE_NUMBER_ID:
        return
    if not to or not to.strip():
        return
    try:
        import urllib.request
        payload = json.dumps({
            "content": body,
            "from": OPENPHONE_PHONE_NUMBER_ID,
            "to": [to.strip()],
        }).encode()
        req = urllib.request.Request(
            "https://api.openphone.com/v1/messages",
            data=payload,
            headers={
                "Authorization": OPENPHONE_API_KEY,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception:
        pass


def send_booking_confirmation_sms(*, to_phone: str, patient_name: str, confirmation_number: str,
                                   appointment_datetime: str, provider: str, zoom_join_url: str = None):
    lines = [
        f"Hi {patient_name}! Your Lifeway Programs appt is confirmed.",
        f"Confirmation: {confirmation_number}",
        f"When: {appointment_datetime}",
        f"Provider: {provider}",
    ]
    if zoom_join_url:
        lines.append(f"Telehealth link: {zoom_join_url}")
    lines.append("Reply STOP to opt out.")
    _send_sms(to_phone, "\n".join(lines))


def send_payment_request_sms(*, to_phone: str, client_name: str, amount_str: str,
                              description: str, checkout_url: str):
    lines = [
        f"Hi {client_name}, Lifeway Programs sent you a payment request.",
        f"Amount: {amount_str} — {description}",
        f"Pay securely: {checkout_url}",
        "Reply STOP to opt out.",
    ]
    _send_sms(to_phone, "\n".join(lines))


def send_appointment_reminder_sms(*, to_phone: str, patient_name: str, confirmation_number: str,
                                   appointment_datetime: str, zoom_join_url: str = None):
    lines = [
        f"Reminder: {patient_name}, you have a Lifeway Programs appointment tomorrow.",
        f"When: {appointment_datetime}",
        f"Confirmation: {confirmation_number}",
    ]
    if zoom_join_url:
        lines.append(f"Join online: {zoom_join_url}")
    lines.append("To cancel, call our office. Reply STOP to opt out.")
    _send_sms(to_phone, "\n".join(lines))
