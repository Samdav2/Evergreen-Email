import os
from typing import Generator
from sqlmodel import SQLModel, create_engine, Session

# Support Railway's DATABASE_URL env var (PostgreSQL or SQLite)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evergreen_mail.db")

# SQLite needs check_same_thread=False; PostgreSQL does not
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

def init_db() -> None:
    """Initialize SQLModel database tables."""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency for providing SQLModel database sessions."""
    with Session(engine) as session:
        yield session

