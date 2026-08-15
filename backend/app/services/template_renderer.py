import json
from typing import List, Dict, Any, Optional

import re

def extract_first_name(email: str, first_name: Optional[str] = None) -> str:
    if first_name and first_name.strip():
        return first_name.strip().capitalize()
    if not email:
        return "there"
    username = email.split("@")[0]
    clean = re.split(r'[\._\+\-]', username)[0]
    clean = re.sub(r'\d+$', '', clean)
    if clean and len(clean) >= 2:
        return clean.capitalize()
    return "there"

def _replace_personalization_tags(text: str, recipient_context: Optional[Dict[str, str]] = None) -> str:
    if not text:
        return text
    ctx = recipient_context or {}
    first_name = ctx.get("first_name") or "there"
    email = ctx.get("email") or ""
    last_name = ctx.get("last_name") or ""
    company = ctx.get("company") or ""
    name = ctx.get("name") or (f"{first_name} {last_name}".strip() if last_name else first_name)
    unsubscribe_url = ctx.get("unsubscribe_url") or ""

    replacements = {
        "{{first_name}}": first_name,
        "{{First_Name}}": first_name,
        "{{FIRST_NAME}}": first_name,
        "{{name}}": name,
        "{{Name}}": name,
        "{{last_name}}": last_name,
        "{{email}}": email,
        "{{company}}": company,
        "{{unsubscribe_url}}": unsubscribe_url,
    }
    result = text
    for tag, val in replacements.items():
        result = result.replace(tag, val)
    return result

def render_content_blocks(
    content_json: str,
    unsubscribe_url: str = "",
    settings: Optional[Any] = None,
    recipient_context: Optional[Dict[str, str]] = None
) -> str:
    blocks: List[Dict[str, Any]] = json.loads(content_json) if content_json else []
    
    header_html = _render_header_banner(settings)
    rows = "".join(_render_block(b, unsubscribe_url, recipient_context) for b in blocks)
    cta_html = _render_cta_section(settings)
    footer_html = _render_footer_with_address(unsubscribe_url, settings)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:20px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          {header_html}
          {rows}
          {cta_html}
        </table>
        {footer_html}
      </td>
    </tr>
  </table>
</body>
</html>"""


def _render_header_banner(settings: Optional[Any]) -> str:
    if not settings:
        return ""
    
    bg_color = getattr(settings, "header_bg_color", "#002d1c") or "#002d1c"
    text_color = getattr(settings, "header_text_color", "#ffffff") or "#ffffff"
    title = getattr(settings, "header_title", None)
    logo_url = getattr(settings, "header_logo_url", None)

    if not title and not logo_url:
        return ""

    logo_img = f'<img src="{logo_url}" alt="Header Logo" style="max-height:48px;max-width:180px;display:inline-block;margin-bottom:12px;border:0;" />' if logo_url else ""
    title_text = f'<h1 style="margin:0;font-size:22px;font-weight:700;color:{text_color};letter-spacing:-0.5px;">{title}</h1>' if title else ""

    return f"""<tr>
  <td style="background-color:{bg_color};padding:28px 24px;text-align:center;">
    {logo_img}
    {title_text}
  </td>
</tr>"""


def _render_cta_section(settings: Optional[Any]) -> str:
    if not settings:
        return ""
    
    website_url = getattr(settings, "website_url", None)
    cta_text = getattr(settings, "cta_link_text", "Visit Our Website") or "Visit Our Website"
    as_button = getattr(settings, "cta_as_button", True)

    if not website_url:
        return ""

    if as_button:
        return f"""<tr>
  <td style="padding:16px 24px;text-align:center;border-top:1px solid #e8e8e8;">
    <a href="{website_url}" style="color:#059669;font-weight:600;font-size:14px;text-decoration:underline;font-family:sans-serif;">{cta_text}</a>
  </td>
</tr>"""
    else:
        return f"""<tr>
  <td style="padding:16px 24px;text-align:center;border-top:1px solid #e8e8e8;">
    <p style="margin:0;font-size:14px;color:#475569;">
      <a href="{website_url}" style="color:#059669;font-weight:600;text-decoration:underline;">{cta_text}</a>
    </p>
  </td>
</tr>"""


def _render_block(block: Dict[str, Any], unsubscribe_url: str, recipient_context: Optional[Dict[str, str]] = None) -> str:
    btype = block.get("type", "text")
    content = _replace_personalization_tags(block.get("content", ""), recipient_context)
    styles = block.get("styles", {})

    if btype == "text":
        return _render_text(content, styles)
    elif btype == "image":
        return _render_image(content, styles)
    elif btype == "button":
        return _render_button(content, styles)
    elif btype == "spacer":
        return _render_spacer(styles)
    elif btype == "divider":
        return _render_divider(styles)
    return ""


def _inline_style(styles: Dict[str, Any], extra: str = "") -> str:
    parts: list = []
    color = styles.get("color")
    bg = styles.get("backgroundColor")
    fs = styles.get("fontSize")
    fw = styles.get("fontWeight")
    align = styles.get("textAlign", "left")
    pt = styles.get("padding", "16px 24px")
    br = styles.get("borderRadius")

    if color:
        parts.append(f"color:{color}")
    if bg:
        parts.append(f"background-color:{bg}")
    if fs:
        parts.append(f"font-size:{fs}")
    if fw:
        parts.append(f"font-weight:{fw}")
    parts.append(f"text-align:{align}")
    parts.append(f"padding:{pt}")
    if br:
        parts.append(f"border-radius:{br}")
    if extra:
        parts.append(extra)
    return ";".join(parts)


def _render_text(content: str, styles: Dict[str, Any]) -> str:
    # Ensure default text alignment is left if not explicitly set
    styles_dict = dict(styles) if styles else {}
    if "textAlign" not in styles_dict:
        styles_dict["textAlign"] = "left"
    return f"""<tr><td style="{_inline_style(styles_dict, "font-family:inherit;line-height:1.6;color:#1e293b;")}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <div style="{_inline_style(styles_dict, "line-height:1.6;")}">{content}</div>
  </td></tr></table>
</td></tr>"""



def _render_image(content: str, styles: Dict[str, Any]) -> str:
    alt_text = styles.get("altText") or styles.get("alt") or "Email Image"
    return f"""<tr><td style="padding:0;">
  <img src="{content}" alt="{alt_text}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;" />
</td></tr>"""


def _render_button(content: str, styles: Dict[str, Any]) -> str:
    bg = styles.get("backgroundColor", "#002d1c")
    color = styles.get("color", "#ffffff")
    br = styles.get("borderRadius", "8px")
    align = styles.get("textAlign", "center")
    pt = styles.get("padding", "16px 24px")

    link_url = styles.get("linkUrl") if isinstance(styles, dict) else None
    if link_url:
        link_href = link_url
    elif content.startswith("http") or content.startswith("mailto:"):
        link_href = content
    else:
        link_href = "#"

    return f"""<tr><td style="padding:{pt};text-align:{align};">
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{link_href}" style="height:40px;v-text-anchor:middle;" arcsize="{int(br.replace("px", "")) * 2 if "px" in str(br) else 10}%" strokecolor="{bg}" fillcolor="{bg}">
    <w:anchorlock/>
    <center style="color:{color};font-family:sans-serif;font-size:14px;font-weight:bold;">{content}</center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-- -->
  <a href="{link_href}" style="display:inline-block;background-color:{bg};color:{color};text-decoration:none;font-weight:bold;font-size:14px;padding:12px 32px;border-radius:{br};font-family:sans-serif;">{content}</a>
  <!--<![endif]-->
</td></tr>"""


def _render_spacer(styles: Dict[str, Any]) -> str:
    height = styles.get("padding", "24px")
    return f"""<tr><td style="padding:0;font-size:1px;line-height:1px;" height="{height}">&nbsp;</td></tr>"""


def _render_divider(styles: Dict[str, Any]) -> str:
    pt = styles.get("padding", "16px 24px")
    return f"""<tr><td style="padding:{pt};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #e2e8f0;width:100%;"></td></tr></table>
</td></tr>"""


def _render_footer_with_address(unsubscribe_url: str, settings: Optional[Any]) -> str:
    b_name = getattr(settings, "business_name", "Simple Email Inc.") if settings else "Simple Email Inc."
    b_addr = getattr(settings, "business_address", "") if settings else ""
    b_city = getattr(settings, "business_city", "") if settings else ""
    b_state = getattr(settings, "business_state", "") if settings else ""
    b_zip = getattr(settings, "business_zip", "") if settings else ""
    b_country = getattr(settings, "business_country", "") if settings else ""

    address_parts = [p for p in [b_addr, b_city, f"{b_state} {b_zip}".strip(), b_country] if p]
    address_line = ", ".join(address_parts)

    address_html = f"""<p style="margin:4px 0 0;font-size:11px;color:#94a3b8;font-family:sans-serif;">
      <strong>{b_name}</strong>{f' &bull; {address_line}' if address_line else ''}
    </p>""" if b_name else ""

    unsub_html = f"""<p style="margin:6px 0 0;">
      <a href="{unsubscribe_url or '#'}" style="color:#94a3b8;font-size:11px;text-decoration:underline;">Unsubscribe</a>
    </p>"""

    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:20px 16px 8px;">
      {address_html}
      {unsub_html}
    </td>
  </tr>
</table>"""


import re

def render_plain_text(
    content_json: str,
    settings: Optional[Any] = None,
    recipient_context: Optional[Dict[str, str]] = None
) -> str:
    if not content_json:
        return ""
    try:
        blocks: List[Dict[str, Any]] = json.loads(content_json)
    except Exception:
        return ""
        
    parts: list = []
    
    if settings:
        h_title = getattr(settings, "header_title", None)
        if h_title:
            parts.append(_replace_personalization_tags(h_title, recipient_context))

    for b in blocks:
        t = b.get("type", "")
        c = _replace_personalization_tags(b.get("content", ""), recipient_context)
        st = b.get("styles", {})
        if t == "text":
            clean = re.sub(r'<br\s*/?>', '\n', c)
            clean = re.sub(r'</p>', '\n\n', clean)
            clean = re.sub(r'<[^>]+>', '', clean)
            if clean.strip():
                parts.append(clean.strip())
        elif t == "button":
            link_url = st.get("linkUrl") if isinstance(st, dict) else None
            link_href = link_url or (c if c.startswith("http") else "")
            if link_href:
                parts.append(f"[{c}] ({link_href})")
            else:
                parts.append(f"[{c}]")
        elif t == "divider":
            parts.append("---")
        elif t == "image":
            alt = st.get("altText") if isinstance(st, dict) else "Image"
            parts.append(f"[{alt}]")

    if settings:
        website_url = getattr(settings, "website_url", None)
        cta_text = getattr(settings, "cta_link_text", None)
        if website_url and cta_text:
            parts.append(f"{cta_text}: {website_url}")

    return "\n\n".join([p for p in parts if p.strip()])
