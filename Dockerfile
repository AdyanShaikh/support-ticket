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

# Copy backend application source
COPY backend/ .

ENV PORT=8000
ENV PYTHONPATH=/app
EXPOSE 8000

# Run uvicorn via shell to properly evaluate $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
