from typing import Generic, TypeVar, Type, Optional, List
from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)

class BaseRepository(Generic[T]):
    """Generic Base Repository implementing OOP CRUD access patterns."""

    def __init__(self, model_class: Type[T], session: Session) -> None:
        self.model_class = model_class
        self.session = session

    def get_by_id(self, id_val: int) -> Optional[T]:
        return self.session.get(self.model_class, id_val)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        statement = select(self.model_class).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def create(self, entity: T) -> T:
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def update(self, entity: T) -> T:
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def delete(self, id_val: int) -> bool:
        entity = self.get_by_id(id_val)
        if entity:
            self.session.delete(entity)
            self.session.commit()
            return True
        return False
