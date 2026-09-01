import os
import time
import logging
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

logger = logging.getLogger("uvicorn.error")

# Load environment variables from .env file
load_dotenv()

# Get database connection string from environment (Railway PostgreSQL sets DATABASE_URL, DATABASE_PRIVATE_URL, or DATABASE_PUBLIC_URL)
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("DATABASE_PRIVATE_URL")
    or os.getenv("DATABASE_PUBLIC_URL")
    or "sqlite:///./evergreen_mail.db"
)

# SQLAlchemy requires postgresql:// instead of legacy postgres:// scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Check if user is using direct Supabase URL which is IPv6-only and fails on Render/Railway
if "supabase.co" in DATABASE_URL and "pooler.supabase.com" not in DATABASE_URL:
    print(
        "\n[DATABASE WARNING] You are using Supabase Direct connection domain (db.xxx.supabase.co).\n"
        "Direct domain is IPv6-only. Platforms like Render/Railway do not support IPv6 outbound network traffic.\n"
        "FIX: In Supabase Dashboard -> Project Settings -> Database -> Connection String -> Connection Pooler,\n"
        "use the Pooler connection string (host: aws-0-xxx.pooler.supabase.com, port: 6543 or 5432).\n"
    )

# Configure connection args based on database engine
is_sqlite = DATABASE_URL.startswith("sqlite")
if is_sqlite:
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if db_path and not db_path.startswith(":memory:"):
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

connect_args = {"check_same_thread": False} if is_sqlite else {}

# Create engine with pool_pre_ping to handle dropped remote PostgreSQL connections
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

def init_db(max_retries: int = 3, retry_interval: int = 2) -> None:
    """Initialize SQLModel database tables with connection retries."""
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[DB] Initializing database (Attempt {attempt}/{max_retries})...")
            SQLModel.metadata.create_all(engine)
            print("[DB] Database connection established and tables verified.")
            return
        except Exception as e:
            err_str = str(e)
            print(f"[DB ERROR] Connection attempt {attempt}/{max_retries} failed: {err_str}")
            if "Network is unreachable" in err_str or "supabase.co" in DATABASE_URL:
                print(
                    "\n[SUPABASE / RENDER IPV6 FIX REQUIRED]\n"
                    "Render cannot connect to Supabase direct host (db.xxx.supabase.co) over IPv6.\n"
                    "Please update your DATABASE_URL environment variable on Render to use your Supabase Pooler URL:\n"
                    "Example: postgresql://postgres.REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres\n"
                )
            if attempt < max_retries:
                time.sleep(retry_interval)
            else:
                raise e

def get_session() -> Generator[Session, None, None]:
    """Dependency for providing SQLModel database sessions."""
    with Session(engine) as session:
        yield session



