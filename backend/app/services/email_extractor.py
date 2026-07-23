import re
import email
import tempfile
import os
from email import policy
from email.utils import getaddresses
from typing import List, Dict, Optional
from pathlib import Path

import pandas as pd
from io import BytesIO


def extract_from_eml(content: bytes) -> List[Dict[str, str]]:
    msg = email.message_from_bytes(content, policy=policy.default)
    contacts: List[Dict[str, str]] = []
    seen: set = set()

    for header in ("From", "To", "Cc", "Bcc"):
        raw = msg.get(header, "")
        if not raw:
            continue
        for display_name, addr in getaddresses([raw]):
            addr = addr.strip().lower()
            if addr and "@" in addr and addr not in seen:
                seen.add(addr)
                contact: Dict[str, str] = {
                    "email": addr,
                    "first_name": "",
                    "company": "",
                }
                if display_name and display_name != addr:
                    contact["first_name"] = display_name.strip().split()[0].strip("'\"")
                contacts.append(contact)

    if not contacts:
        body = _get_body_text(msg)
        found = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", body)
        for addr in found:
            addr = addr.lower()
            if addr not in seen:
                seen.add(addr)
                contacts.append({"email": addr, "first_name": "", "company": ""})

    return contacts


def extract_from_msg(content: bytes) -> List[Dict[str, str]]:
    try:
        from extract_msg import Message
    except ImportError:
        raise ValueError(
            "extract-msg library is required to parse .msg files. Install with: pip install extract-msg"
        )

    msg = Message(BytesIO(content))
    contacts: List[Dict[str, str]] = []
    seen: set = set()

    for hdr_field, attr in [
        ("sender", "sender"),
        ("to", "to"),
        ("cc", "cc"),
        ("bcc", "bcc"),
    ]:
        raw = getattr(msg, attr, None)
        if not raw:
            continue
        for addr in re.findall(
            r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", str(raw)
        ):
            addr = addr.lower()
            if addr not in seen:
                seen.add(addr)
                contacts.append({"email": addr, "first_name": "", "company": ""})

    return contacts


def extract_from_mbox(content: bytes) -> List[Dict[str, str]]:
    import mailbox

    contacts: List[Dict[str, str]] = []
    seen: set = set()

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mbox")
    try:
        tmp.write(content)
        tmp.close()
        mbox = mailbox.mbox(tmp.name)
        for _msg in mbox:
            for header in ("From", "To", "Cc", "Bcc"):
                raw = _msg.get(header, "")
                if not raw:
                    continue
                for display_name, addr in getaddresses([raw]):
                    addr = addr.strip().lower()
                    if addr and "@" in addr and addr not in seen:
                        seen.add(addr)
                        contact: Dict[str, str] = {
                            "email": addr,
                            "first_name": "",
                            "company": "",
                        }
                        if display_name and display_name != addr:
                            contact["first_name"] = (
                                display_name.strip().split()[0].strip("'\"")
                            )
                        contacts.append(contact)
    finally:
        os.unlink(tmp.name)

    return contacts


def extract_from_csv(content: bytes) -> List[Dict[str, str]]:
    encodings = ["utf-8", "utf-8-sig", "latin-1", "iso-8859-1", "cp1252", "utf-16"]
    delimiters = [",", "\t", ";", "|"]

    for enc in encodings:
        best_df = None
        best_cols = 0
        for delim in delimiters:
            try:
                df = pd.read_csv(
                    BytesIO(content),
                    encoding=enc,
                    sep=delim,
                    engine="python",
                    on_bad_lines="skip",
                )
                ncols = df.shape[1]
                if ncols == 0:
                    continue
                has_at = df.to_string(index=False).count("@") > 0
                if ncols >= 2 and has_at:
                    return _extract_from_dataframe(df)
                if ncols > best_cols:
                    best_cols = ncols
                    best_df = df
            except Exception:
                continue
        if best_df is not None and best_cols >= 1:
            return _extract_from_dataframe(best_df)

    raise ValueError(
        "Unable to parse CSV file. Try saving it as UTF-8 with commas as delimiters."
    )


def extract_from_excel(content: bytes, ext: str) -> List[Dict[str, str]]:
    engine = "openpyxl" if ext == "xlsx" else "xlrd"
    df = pd.read_excel(BytesIO(content), engine=engine)
    return _extract_from_dataframe(df)


def _extract_from_dataframe(df: pd.DataFrame) -> List[Dict[str, str]]:
    contacts: List[Dict[str, str]] = []
    seen: set = set()

    email_col = None
    for col in df.columns:
        if col.strip().lower() == "email":
            email_col = col
            break

    first_name_col = next(
        (c for c in df.columns if "first" in c.lower() and "name" in c.lower()), None
    )
    last_name_col = next(
        (c for c in df.columns if "last" in c.lower() and "name" in c.lower()), None
    )
    company_col = next(
        (c for c in df.columns if "company" in c.lower() or "org" in c.lower()), None
    )

    if email_col:
        for _, row in df.iterrows():
            email = str(row[email_col]).strip().lower()
            if email and email != "nan" and email not in seen and "@" in email:
                seen.add(email)
                contact: Dict[str, str] = {
                    "email": email,
                    "first_name": "",
                    "company": "",
                }
                if first_name_col:
                    val = str(row[first_name_col]).strip()
                    if val and val.lower() != "nan":
                        contact["first_name"] = val
                if company_col:
                    val = str(row[company_col]).strip()
                    if val and val.lower() != "nan":
                        contact["company"] = val
                contacts.append(contact)
    else:
        for _, row in df.iterrows():
            for val in row:
                s = str(val).strip().lower()
                if s and s != "nan" and "@" in s and s not in seen:
                    seen.add(s)
                    contacts.append({"email": s, "first_name": "", "company": ""})
                    break

    return contacts


def extract_contacts(content: bytes, filename: str) -> List[Dict[str, str]]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext == "csv":
        return extract_from_csv(content)
    elif ext in ("xls", "xlsx"):
        return extract_from_excel(content, ext)
    elif ext == "eml":
        return extract_from_eml(content)
    elif ext == "msg":
        return extract_from_msg(content)
    elif ext == "mbox":
        return extract_from_mbox(content)
    else:
        raise ValueError(f"No extractor available for .{ext} files")


def _get_body_text(msg: email.message.Message) -> str:
    if msg.is_multipart():
        parts = []
        for part in msg.walk():
            ctype = part.get_content_type()
            if ctype == "text/plain":
                try:
                    parts.append(part.get_content())
                except Exception:
                    pass
        return "\n".join(parts)
    else:
        try:
            return msg.get_content()
        except Exception:
            return ""
