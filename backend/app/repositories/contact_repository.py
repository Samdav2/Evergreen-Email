from typing import List, Optional
from sqlmodel import Session, select, func, delete
from backend.app.models.contact import Contact, ContactStatus
from backend.app.repositories.base_repository import BaseRepository


class ContactRepository(BaseRepository[Contact]):
    """Repository handling Contact audience persistence and status queries."""

    def __init__(self, session: Session) -> None:
        super().__init__(Contact, session)

    def get_by_owner(
        self, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Contact]:
        statement = (
            select(Contact)
            .where(Contact.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_by_email_and_owner(self, email: str, owner_id: int) -> Optional[Contact]:
        statement = select(Contact).where(
            Contact.email == email, Contact.owner_id == owner_id
        )
        return self.session.exec(statement).first()

    def count_by_status(self, owner_id: int, status: ContactStatus) -> int:
        statement = select(func.count(Contact.id)).where(
            Contact.owner_id == owner_id, Contact.status == status
        )
        result = self.session.exec(statement).first()
        return result or 0

    def count_by_owner(self, owner_id: int) -> int:
        statement = select(func.count(Contact.id)).where(Contact.owner_id == owner_id)
        result = self.session.exec(statement).first()
        return result or 0

    def get_all_emails_by_owner(self, owner_id: int) -> set[str]:
        statement = select(Contact.email).where(Contact.owner_id == owner_id)
        return {row[0].lower() for row in self.session.exec(statement).all()}

    def delete_all_by_owner(self, owner_id: int) -> int:
        statement = delete(Contact).where(Contact.owner_id == owner_id)
        result = self.session.exec(statement)
        self.session.commit()
        return result.rowcount


