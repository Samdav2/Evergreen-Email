from typing import Optional
from sqlmodel import Session, select
from backend.app.models.user import User
from backend.app.repositories.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    """Repository handling User persistence and queries."""

    def __init__(self, session: Session) -> None:
        super().__init__(User, session)

    def get_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()
