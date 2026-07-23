from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.models.contact import ContactStatus
from backend.app.repositories.contact_repository import ContactRepository
from backend.app.dependencies import get_contact_repository

router = APIRouter(prefix="", tags=["Unsubscribe"])


@router.get("/unsubscribe")
def unsubscribe_get(
    email: str = Query(""),
    contact_repo: ContactRepository = Depends(get_contact_repository),
):
    if not email:
        return {
            "message": "To unsubscribe, please click the link in your email.",
            "status": "no_email_provided",
        }
    contact = contact_repo.get_by_email_and_owner(email.strip().lower(), owner_id=1)
    if contact:
        contact.status = ContactStatus.UNSUBSCRIBED
        contact_repo.update(contact)
        return {
            "message": "You have been unsubscribed successfully.",
            "status": "unsubscribed",
        }
    return {
        "message": "Email not found. You may already be unsubscribed.",
        "status": "not_found",
    }


@router.post("/unsubscribe")
def unsubscribe_post(
    email: str = Query(""),
    contact_repo: ContactRepository = Depends(get_contact_repository),
):
    return unsubscribe_get(email, contact_repo)
