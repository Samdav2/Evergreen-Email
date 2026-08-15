import json
import base64
import urllib.request
import urllib.error
import resend
from typing import Optional, Any
from backend.app.core.settings import (
    RESEND_API_KEY,
    DEFAULT_FROM_EMAIL,
    DEFAULT_FROM_NAME,
    DEFAULT_REPLY_TO,
)

def send_email_with_provider(
    provider: str,
    to_email: str,
    subject: str,
    html_content: str,
    plain_text: str = "",
    unsubscribe_url: str = "",
    settings: Optional[Any] = None
) -> dict:
    """
    Sends an email using either Resend or Mailjet provider.
    """
    # Extract credentials & configuration from settings or fallback defaults
    resend_key = getattr(settings, "resend_api_key", None) or RESEND_API_KEY
    mailjet_api_key = getattr(settings, "mailjet_api_key", None)
    mailjet_secret_key = getattr(settings, "mailjet_secret_key", None)
    
    from_email = getattr(settings, "default_from_email", None) or DEFAULT_FROM_EMAIL
    from_name = getattr(settings, "default_from_name", None) or DEFAULT_FROM_NAME
    reply_to = getattr(settings, "default_reply_to", None) or DEFAULT_REPLY_TO
    
    provider_clean = (provider or "resend").lower().strip()

    if provider_clean == "mailjet":
        return _send_via_mailjet(
            api_key=mailjet_api_key,
            secret_key=mailjet_secret_key,
            from_email=from_email,
            from_name=from_name,
            reply_to=reply_to,
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            plain_text=plain_text,
            unsubscribe_url=unsubscribe_url
        )
    else: # Default to Resend
        return _send_via_resend(
            api_key=resend_key,
            from_email=from_email,
            from_name=from_name,
            reply_to=reply_to,
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            plain_text=plain_text,
            unsubscribe_url=unsubscribe_url
        )


def _send_via_resend(
    api_key: Optional[str],
    from_email: str,
    from_name: str,
    reply_to: Optional[str],
    to_email: str,
    subject: str,
    html_content: str,
    plain_text: str = "",
    unsubscribe_url: str = ""
) -> dict:
    if not api_key or not str(api_key).startswith("re_") or api_key == "your_resend_api_key_here":
        return {
            "status": "mock",
            "provider": "resend",
            "to": to_email,
            "message": "Resend API Key is missing or placeholder. Email logged in mock mode.",
        }

    resend.api_key = api_key
    from_field = f"{from_name} <{from_email}>" if from_name else from_email
    
    # Primary inbox deliverability headers
    headers = {
        "X-Entity-Ref-ID": f"msg-{abs(hash(subject))}",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Importance": "Normal",
    }
    if unsubscribe_url:
        headers["List-Unsubscribe"] = f"<{unsubscribe_url}>"
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

    params: dict = {
        "from": from_field,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
        "headers": headers,
    }
    
    # Ensure Reply-To is always set for personal/Primary inbox classification
    effective_reply_to = reply_to or from_email
    if effective_reply_to:
        params["reply_to"] = effective_reply_to

    if plain_text:
        params["text"] = plain_text
    else:
        # Fallback basic text conversion to ensure plain text alternative is never missing
        import re
        params["text"] = re.sub(r'<[^>]+>', '', html_content).strip()

    try:
        response = resend.Emails.send(params)
        return {"status": "success", "provider": "resend", "response": response}
    except Exception as e:
        err_msg = str(e)
        print(f"[Resend Dispatch Warning] Could not send to {to_email} via Resend API ({err_msg}). Falling back to mock delivery.")
        return {
            "status": "mock",
            "provider": "resend",
            "to": to_email,
            "message": f"Resend API warning ({err_msg}). Dispatched via mock mode.",
        }


def _send_via_mailjet(
    api_key: Optional[str],
    secret_key: Optional[str],
    from_email: str,
    from_name: str,
    reply_to: Optional[str],
    to_email: str,
    subject: str,
    html_content: str,
    plain_text: str = "",
    unsubscribe_url: str = ""
) -> dict:
    if not api_key or not secret_key:
        return {
            "status": "mock",
            "provider": "mailjet",
            "to": to_email,
            "message": "Mailjet API Key or Secret Key missing. Email logged in mock mode.",
        }

    url = "https://api.mailjet.com/v3.1/send"
    
    headers_dict = {
        "X-Entity-Ref-ID": f"msg-{abs(hash(subject))}",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
    }
    if unsubscribe_url:
        headers_dict["List-Unsubscribe"] = f"<{unsubscribe_url}>"

    import re
    effective_plain_text = plain_text or re.sub(r'<[^>]+>', '', html_content).strip()
    effective_reply_to = reply_to or from_email

    message = {
        "From": {
            "Email": from_email,
            "Name": from_name or "Evergreen Mail"
        },
        "To": [
            {
                "Email": to_email
            }
        ],
        "Subject": subject,
        "HTMLPart": html_content,
        "TextPart": effective_plain_text,
    }
    if effective_reply_to:
        message["ReplyTo"] = {"Email": effective_reply_to}
    if headers_dict:
        message["Headers"] = headers_dict

    payload = {"Messages": [message]}
    json_data = json.dumps(payload).encode("utf-8")

    auth_str = f"{api_key}:{secret_key}"
    b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

    req = urllib.request.Request(
        url,
        data=json_data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Basic {b64_auth}"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = json.loads(resp.read().decode("utf-8"))
            return {"status": "success", "provider": "mailjet", "response": resp_body}
    except urllib.error.HTTPError as e:
        error_content = e.read().decode("utf-8")
        return {"status": "error", "provider": "mailjet", "error": f"HTTP {e.code}: {error_content}"}
    except Exception as e:
        return {"status": "error", "provider": "mailjet", "error": str(e)}


def send_campaign_email(
    to_email: str,
    subject: str,
    html_body: str,
    plain_text: str = "",
    unsubscribe_url: str = "",
    settings: Optional[Any] = None
) -> dict:
    """
    Main entry point for dispatching campaign emails.
    """
    provider = getattr(settings, "active_email_provider", "resend")
    return send_email_with_provider(
        provider=provider,
        to_email=to_email,
        subject=subject,
        html_content=html_body,
        plain_text=plain_text,
        unsubscribe_url=unsubscribe_url,
        settings=settings
    )
