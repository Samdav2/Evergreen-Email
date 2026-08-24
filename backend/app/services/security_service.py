import os
import io
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx", "eml", "msg"}
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

MAGIC_SIGNATURES: dict[str, list[bytes]] = {
    "csv": [b",", b"\t", b'"'],
    "xls": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
    "xlsx": [b"\x50\x4b\x03\x04"],
    "eml": [b"From:", b"Return-Path:", b"Received:", b"Date:", b"Subject:"],
    "msg": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
}

CLAM_AVAILABLE = False
try:
    from clamd import ClamdNetworkSocket, ClamdUnixSocket

    try:
        clamd = ClamdUnixSocket()
        clamd.ping()
        CLAM_AVAILABLE = True
    except Exception:
        try:
            clamd = ClamdNetworkSocket()
            clamd.ping()
            CLAM_AVAILABLE = True
        except Exception:
            logger.warning("ClamAV is not available — virus scanning disabled")
except ImportError:
    logger.warning("clamd package not installed — virus scanning disabled")


def check_extension(filename: str) -> Tuple[bool, str]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        return (
            False,
            f"Unsupported file format '.{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    return True, ext


def check_magic_bytes(content: bytes, ext: str) -> Tuple[bool, str]:
    sigs = MAGIC_SIGNATURES.get(ext)
    if not sigs:
        return True, ""
    header = content[:1024]
    for sig in sigs:
        if header[: len(sig)] == sig or header.find(sig) != -1:
            return True, ""
    return False, f"File content does not match expected format for .{ext}"


def check_file_size(size: int) -> Tuple[bool, str]:
    if size > MAX_FILE_SIZE_BYTES:
        return False, f"File exceeds maximum size of {MAX_FILE_SIZE_MB}MB"
    return True, ""


def scan_virus(content: bytes) -> Tuple[bool, str]:
    if not CLAM_AVAILABLE:
        return True, "Virus scan skipped (ClamAV not available)"
    try:
        result = clamd.instream(io.BytesIO(content))
        if result["stream"][0] == "FOUND":
            return False, f"Virus detected: {result['stream'][1]}"
        return True, ""
    except Exception as e:
        logger.warning(f"ClamAV scan failed: {e}")
        return True, "Virus scan unavailable — file allowed through"


def validate_and_scan(filename: str, content: bytes) -> None:
    ok, msg = check_extension(filename)
    if not ok:
        raise ValueError(msg)

    ext = filename.rsplit(".", 1)[-1].lower()
    ok, msg = check_file_size(len(content))
    if not ok:
        raise ValueError(msg)

    ok, msg = check_magic_bytes(content, ext)
    if not ok:
        raise ValueError(msg)

    ok, msg = scan_virus(content)
    if not ok:
        raise ValueError(msg)
