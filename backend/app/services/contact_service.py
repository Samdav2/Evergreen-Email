import re
from typing import List
from fastapi import UploadFile
from backend.app.models.contact import Contact, ContactStatus
from backend.app.repositories.contact_repository import ContactRepository
from backend.app.schemas.contact import (
    ContactRead,
    ContactImportSummary,
    PaginatedContacts,
)
from backend.app.services.security_service import validate_and_scan
from backend.app.services.email_extractor import extract_contacts


class ContactService:
    def __init__(self, contact_repo: ContactRepository) -> None:
        self.contact_repo = contact_repo

    def validate_email(self, email: str) -> bool:
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        return bool(re.match(pattern, email.strip()))

    def parse_manual_text(self, raw_text: str, owner_id: int) -> ContactImportSummary:
        lines = [
            line.strip()
            for line in raw_text.replace(",", "\n").split("\n")
            if line.strip()
        ]
        existing_contacts = self.contact_repo.get_all_emails_by_owner(owner_id)

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
                owner_id=owner_id,
            )
            saved = self.contact_repo.create(contact)
            processed_contacts.append(ContactRead.model_validate(saved))

        return ContactImportSummary(
            total_detected=len(lines),
            valid_count=valid_count,
            duplicate_count=duplicate_count,
            invalid_count=invalid_count,
            contacts=processed_contacts,
        )

    def parse_uploaded_file(
        self, file: UploadFile, owner_id: int
    ) -> ContactImportSummary:
        if not file.filename:
            raise ValueError("No file provided.")

        content = file.file.read()
        validate_and_scan(file.filename, content)

        extracted = extract_contacts(content, file.filename)

        if not extracted:
            raise ValueError("No email addresses found in the file.")

        existing_set = self.contact_repo.get_all_emails_by_owner(owner_id)
        processed: List[ContactRead] = []
        valid_count = 0
        duplicate_count = 0
        invalid_count = 0
        total_detected = len(extracted)

        for entry in extracted:
            email_clean = entry["email"].lower().strip()
            if not self.validate_email(email_clean):
                invalid_count += 1
                continue

            status = ContactStatus.VALID
            if email_clean in existing_set:
                status = ContactStatus.DUPLICATE
                duplicate_count += 1
            else:
                valid_count += 1
                existing_set.add(email_clean)

            contact = Contact(
                email=email_clean,
                first_name=entry.get("first_name")
                or email_clean.split("@")[0].capitalize(),
                company=entry.get("company") or "External Contact",
                status=status,
                owner_id=owner_id,
            )
            saved = self.contact_repo.create(contact)
            processed.append(ContactRead.model_validate(saved))

        return ContactImportSummary(
            total_detected=total_detected,
            valid_count=valid_count,
            duplicate_count=duplicate_count,
            invalid_count=invalid_count,
            contacts=processed,
        )

    def get_audience_contacts(
        self, owner_id: int, page: int = 1, page_size: int = 100
    ) -> PaginatedContacts:
        skip = (page - 1) * page_size
        contacts = self.contact_repo.get_by_owner(owner_id, skip=skip, limit=page_size)
        total = self.contact_repo.count_by_owner(owner_id)
        items = [ContactRead.model_validate(c) for c in contacts]
        return PaginatedContacts(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_next=(skip + page_size) < total,
        )

    def delete_all_contacts(self, owner_id: int) -> int:
        return self.contact_repo.delete_all_by_owner(owner_id)
