from typing import Generator
from sqlmodel import SQLModel, create_engine, Session

# SQLite file-based database for SQLModel persistence
DATABASE_URL = "sqlite:///./evergreen_mail.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

def init_db() -> None:
    """Initialize SQLModel database tables."""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency for providing SQLModel database sessions."""
    with Session(engine) as session:
        yield session
