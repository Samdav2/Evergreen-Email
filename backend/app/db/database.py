import os
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

# Load environment variables from .env file
load_dotenv()

# Get database connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evergreen_mail.db")

# SQLAlchemy requires postgresql:// instead of legacy postgres:// scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure connection args based on database engine
is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# Create engine with pool_pre_ping to handle dropped remote PostgreSQL connections
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

def init_db() -> None:
    """Initialize SQLModel database tables."""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency for providing SQLModel database sessions."""
    with Session(engine) as session:
        yield session


