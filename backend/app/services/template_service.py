from typing import List, Optional
from backend.app.models.template import Template
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.schemas.template import TemplateCreate, TemplateUpdate, TemplateRead

class TemplateService:
    """Service handling Email Template builder business logic."""

    def __init__(self, template_repo: TemplateRepository) -> None:
        self.template_repo = template_repo

    def create_template(self, dto: TemplateCreate, owner_id: int) -> TemplateRead:
        template = Template(
            name=dto.name,
            description=dto.description,
            subject_line=dto.subject_line,
            content_json=dto.content_json,
            category=dto.category,
            owner_id=owner_id
        )
        saved = self.template_repo.create(template)
        return TemplateRead.model_validate(saved)

    def get_templates(self, owner_id: int) -> List[TemplateRead]:
        templates = self.template_repo.get_by_owner(owner_id)
        return [TemplateRead.model_validate(t) for t in templates]

    def update_template(self, template_id: int, dto: TemplateUpdate) -> Optional[TemplateRead]:
        existing = self.template_repo.get_by_id(template_id)
        if not existing:
            return None

        if dto.name:
            existing.name = dto.name
        if dto.subject_line:
            existing.subject_line = dto.subject_line
        if dto.content_json:
            existing.content_json = dto.content_json

        updated = self.template_repo.update(existing)
        return TemplateRead.model_validate(updated)
