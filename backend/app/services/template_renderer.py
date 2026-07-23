import json
from typing import List, Dict, Any


def render_content_blocks(content_json: str, unsubscribe_url: str = "") -> str:
    blocks: List[Dict[str, Any]] = json.loads(content_json)
    rows = "".join(_render_block(b, unsubscribe_url) for b in blocks)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
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
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          {rows}
        </table>
        {_render_footer(unsubscribe_url)}
      </td>
    </tr>
  </table>
</body>
</html>"""


def _render_block(block: Dict[str, Any], unsubscribe_url: str) -> str:
    btype = block.get("type", "text")
    content = block.get("content", "")
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
    return f"""<tr><td style="{_inline_style(styles, "font-family:inherit;line-height:1.6;color:#1e293b;")}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <p style="margin:0;{_inline_style(styles, "line-height:1.6;")}">{content}</p>
  </td></tr></table>
</td></tr>"""


def _render_image(content: str, styles: Dict[str, Any]) -> str:
    return f"""<tr><td style="padding:0;">
  <img src="{content}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;" />
</td></tr>"""


def _render_button(content: str, styles: Dict[str, Any]) -> str:
    bg = styles.get("backgroundColor", "#002d1c")
    color = styles.get("color", "#ffffff")
    br = styles.get("borderRadius", "8px")
    align = styles.get("textAlign", "center")
    pt = styles.get("padding", "16px 24px")

    return f"""<tr><td style="padding:{pt};text-align:{align};">
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{content}" style="height:40px;v-text-anchor:middle;" arcsize="{int(br.replace("px", "")) * 2}%" strokecolor="{bg}" fillcolor="{bg}">
    <w:anchorlock/>
    <center style="color:{color};font-family:sans-serif;font-size:14px;font-weight:bold;">{content}</center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-- -->
  <a href="{content}" target="_blank" style="display:inline-block;background-color:{bg};color:{color};text-decoration:none;font-weight:bold;font-size:14px;padding:12px 32px;border-radius:{br};font-family:sans-serif;">{content}</a>
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


def _render_footer(unsubscribe_url: str) -> str:
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:24px 16px 8px;">
      <p style="margin:0;font-size:11px;color:#94a3b8;font-family:sans-serif;">
        You received this email because you're subscribed to Evergreen Mail.
      </p>
      <p style="margin:8px 0 0;">
        <a href="{unsubscribe_url}" style="color:#94a3b8;font-size:11px;text-decoration:underline;">Unsubscribe</a>
      </p>
    </td>
  </tr>
</table>"""


def render_plain_text(content_json: str) -> str:
    blocks: List[Dict[str, Any]] = json.loads(content_json)
    parts: list = []
    for b in blocks:
        t = b.get("type", "")
        c = b.get("content", "")
        if t == "text":
            parts.append(c)
        elif t == "button":
            parts.append(f"[Link: {c}]")
        elif t == "divider":
            parts.append("---")
    return "\n\n".join(parts)
