FROM python:3.12-slim

WORKDIR /app

# Install system build dependencies for psycopg / compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Patch uvicorn binary in PATH to safely intercept literal "$PORT" strings passed by Railway/Nixpacks
RUN python -c '\
import shutil, os;\
p = shutil.which("uvicorn");\
content = open(p).read();\
patch = "import os, sys\nfor i, a in enumerate(sys.argv):\n    if a in (\"$PORT\", \"${PORT}\", \"${PORT:-8000}\"): sys.argv[i] = os.environ.get(\"PORT\", \"8000\")\n";\
content = content.replace("from uvicorn.main import main", patch + "from uvicorn.main import main");\
open(p, "w").write(content);\
'

# Copy application source
COPY backend/ /app/backend/
COPY backend/app /app/app
COPY run.py /app/run.py

ENV PORT=8000
ENV PYTHONPATH=/app:/app/backend
EXPOSE 8000

CMD ["python", "run.py"]
