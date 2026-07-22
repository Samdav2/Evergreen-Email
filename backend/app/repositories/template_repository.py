from typing import List
from sqlmodel import Session, select
from backend.app.models.template import Template
from backend.app.repositories.base_repository import BaseRepository

class TemplateRepository(BaseRepository[Template]):
    """Repository handling Template persistence."""

    def __init__(self, session: Session) -> None:
        super().__init__(Template, session)

    def get_by_owner(self, owner_id: int) -> List[Template]:
        statement = select(Template).where(Template.owner_id == owner_id)
        return list(self.session.exec(statement).all())
