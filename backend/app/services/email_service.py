import resend
from backend.app.core.settings import (
    RESEND_API_KEY,
    DEFAULT_FROM_EMAIL,
    DEFAULT_FROM_NAME,
    DEFAULT_REPLY_TO,
    APP_URL,
)

resend.api_key = RESEND_API_KEY


def send_campaign_email(
    to_email: str,
    subject: str,
    html_body: str,
    plain_text: str = "",
    unsubscribe_url: str = "",
) -> dict:
    if not RESEND_API_KEY:
        return {
            "id": "mock",
            "to": to_email,
            "note": "RESEND_API_KEY not configured; email not sent",
        }

    params: dict = {
        "from": f"{DEFAULT_FROM_NAME} <{DEFAULT_FROM_EMAIL}>"
        if DEFAULT_FROM_NAME
        else DEFAULT_FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_body,
        "headers": {
            "Precedence": "bulk",
            "X-Entity-Ref-ID": f"campaign-{subject[:32]}",
            "List-Unsubscribe": f"<{unsubscribe_url}>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
    }

    if DEFAULT_REPLY_TO:
        params["reply_to"] = DEFAULT_REPLY_TO

    if plain_text:
        params["text"] = plain_text

    response = resend.Emails.send(params)
    return response
