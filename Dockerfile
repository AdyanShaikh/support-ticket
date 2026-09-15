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

# Copy backend application source and run scripts
COPY backend/ /app/backend/
COPY backend/app /app/app
COPY run.py /app/run.py

ENV PORT=8000
ENV PYTHONPATH=/app:/app/backend
EXPOSE 8000

CMD ["python", "run.py"]
