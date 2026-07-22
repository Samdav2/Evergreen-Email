import re
from typing import List, Dict, Any
from backend.app.models.contact import Contact, ContactStatus
from backend.app.repositories.contact_repository import ContactRepository
from backend.app.schemas.contact import ContactRead, ContactImportSummary

class ContactService:
    """Service handling Audience contact processing, parsing, and validation."""

    def __init__(self, contact_repo: ContactRepository) -> None:
        self.contact_repo = contact_repo

    def validate_email(self, email: str) -> bool:
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        return bool(re.match(pattern, email.strip()))

    def parse_manual_text(self, raw_text: str, owner_id: int) -> ContactImportSummary:
        lines = [line.strip() for line in raw_text.replace(",", "\n").split("\n") if line.strip()]
        existing_contacts = {c.email.lower() for c in self.contact_repo.get_by_owner(owner_id)}

        processed_contacts: List[ContactRead] = []
        valid_count = 0
        duplicate_count = 0
        invalid_count = 0

        for line in lines:
            email = line.strip().lower()
            if not self.validate_email(email):
                invalid_count += 1
                continue

            status = ContactStatus.VALID
            if email in existing_contacts:
                status = ContactStatus.DUPLICATE
                duplicate_count += 1
            else:
                valid_count += 1
                existing_contacts.add(email)

            contact = Contact(
                email=email,
                first_name=email.split("@")[0].capitalize(),
                company="External Contact",
                status=status,
                owner_id=owner_id
            )
            saved = self.contact_repo.create(contact)
            processed_contacts.append(ContactRead.model_validate(saved))

        return ContactImportSummary(
            total_detected=len(lines),
            valid_count=valid_count,
            duplicate_count=duplicate_count,
            invalid_count=invalid_count,
            contacts=processed_contacts
        )

    def get_audience_contacts(self, owner_id: int) -> List[ContactRead]:
        contacts = self.contact_repo.get_by_owner(owner_id)
        return [ContactRead.model_validate(c) for c in contacts]
