from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered
from app.routes.tickets import router as tickets_router
from app.routes.ai import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Support CRM API",
    description="Backend REST API for Datastraw Technologies Support CRM System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.CORS_ORIGINS
# If "*" is specified in origins or dev mode
allow_all = "*" in origins or origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
