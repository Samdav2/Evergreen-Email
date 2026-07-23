import os
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
DEFAULT_FROM_EMAIL: str = os.getenv("DEFAULT_FROM_EMAIL", "onboarding@resend.dev")
DEFAULT_FROM_NAME: str = os.getenv("DEFAULT_FROM_NAME", "Evergreen Mail")
DEFAULT_REPLY_TO: str = os.getenv("DEFAULT_REPLY_TO", "")
APP_URL: str = os.getenv("APP_URL", "http://localhost:3000")
