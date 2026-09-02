from typing import List, Optional
from sqlmodel import Session, select, desc
from backend.app.models.landing_page import LandingPage, FormSubmission, LandingPageClickLog
from backend.app.repositories.base_repository import BaseRepository

class LandingPageRepository(BaseRepository[LandingPage]):
    """Repository handling LandingPage, FormSubmission, and LandingPageClickLog persistence."""

    def __init__(self, session: Session) -> None:
        super().__init__(LandingPage, session)

    def get_by_slug(self, slug: str) -> Optional[LandingPage]:
        statement = select(LandingPage).where(LandingPage.slug == slug)
        return self.session.exec(statement).first()

    def get_by_owner(self, owner_id: int) -> List[LandingPage]:
        statement = select(LandingPage).where(LandingPage.owner_id == owner_id).order_by(desc(LandingPage.created_at))
        return list(self.session.exec(statement).all())

    def increment_views(self, landing_page_id: int) -> None:
        page = self.get_by_id(landing_page_id)
        if page:
            page.views_count += 1
            self.session.add(page)
            self.session.commit()

    def increment_clicks(self, landing_page_id: int) -> None:
        page = self.get_by_id(landing_page_id)
        if page:
            page.cta_clicks_count += 1
            self.session.add(page)
            self.session.commit()

    def increment_submissions(self, landing_page_id: int) -> None:
        page = self.get_by_id(landing_page_id)
        if page:
            page.submissions_count += 1
            self.session.add(page)
            self.session.commit()

    def create_submission(self, submission: FormSubmission) -> FormSubmission:
        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)
        return submission

    def get_submissions_by_page(self, landing_page_id: int) -> List[FormSubmission]:
        statement = (
            select(FormSubmission)
            .where(FormSubmission.landing_page_id == landing_page_id)
            .order_by(desc(FormSubmission.created_at))
        )
        return list(self.session.exec(statement).all())

    def get_all_submissions_for_owner(self, owner_id: int, limit: int = 100) -> List[FormSubmission]:
        statement = (
            select(FormSubmission)
            .join(LandingPage, FormSubmission.landing_page_id == LandingPage.id)
            .where(LandingPage.owner_id == owner_id)
            .order_by(desc(FormSubmission.created_at))
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def create_click_log(self, log: LandingPageClickLog) -> LandingPageClickLog:
        self.session.add(log)
        self.session.commit()
        self.session.refresh(log)
        return log
