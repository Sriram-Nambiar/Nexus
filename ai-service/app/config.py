
import os
from pathlib import Path

# Root directory of the Python AI service
BASE_DIR = Path(__file__).resolve().parent.parent

# Local directory for indexed data and other AI-service files
DATA_DIR = Path(
    os.getenv("NEXUS_AI_DATA_DIR", str(BASE_DIR / "data"))
)

# API server configuration
API_HOST = os.getenv("AI_SERVICE_HOST", "127.0.0.1")
API_PORT = int(os.getenv("AI_SERVICE_PORT", "8000"))

# Maximum permitted upload size in megabytes
MAX_UPLOAD_SIZE_MB = int(
    os.getenv("MAX_UPLOAD_SIZE_MB", "25")
)
