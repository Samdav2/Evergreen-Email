from typing import List
from sqlmodel import Session, select
from backend.app.models.campaign import Campaign, CampaignStatus
from backend.app.repositories.base_repository import BaseRepository

class CampaignRepository(BaseRepository[Campaign]):
    """Repository handling Campaign persistence and logs."""

    def __init__(self, session: Session) -> None:
        super().__init__(Campaign, session)

    def get_by_owner(self, owner_id: int) -> List[Campaign]:
        statement = select(Campaign).where(Campaign.owner_id == owner_id).order_by(Campaign.created_at.desc())
        return list(self.session.exec(statement).all())

    def get_by_status(self, owner_id: int, status: CampaignStatus) -> List[Campaign]:
        statement = select(Campaign).where(Campaign.owner_id == owner_id, Campaign.status == status)
        return list(self.session.exec(statement).all())
