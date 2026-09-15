from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered
from app.routes.tickets import router as tickets_router
from app.routes.ai import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Warning: could not initialize database tables at startup: {e}")
    yield


app = FastAPI(
    title="Support CRM API",
    description="Backend REST API for Support CRM System",
    version="1.0.0",
    lifespan=lifespan
)

# Gzip compression for high-performance payload transfer
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configure CORS to accept localhost, all Vercel domains, and configured origins
origins = settings.CORS_ORIGINS
allow_all = "*" in origins or origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",  # Matches any origin (Vercel, localhost, custom domains) dynamically
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register routers
app.include_router(tickets_router)
app.include_router(ai_router)


@app.get("/", tags=["health"])
def root():
    return {
        "service": "Support CRM API",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
