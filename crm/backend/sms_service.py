import os

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")


def _send_sms(to: str, body: str):
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_FROM_NUMBER:
        print(f"[sms] Twilio not configured — skipping SMS to {to}")
        return
    if not to or not to.strip():
        return
    try:
        from twilio.rest import Client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(body=body, from_=TWILIO_FROM_NUMBER, to=to.strip())
    except Exception as e:
        print(f"[sms] Failed to send to {to}: {e}")


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
