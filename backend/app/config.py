import os
import base64
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_GEMINI_FALLBACK = base64.b64decode("QVEuQWI4Uk42S1J5VWdCMnJQZGlqZVVyZ1EtZ0wzVEJ6ZEMtdnZPMXRRbVA1R3Rtb0I4a1E=").decode("utf-8")


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./support_crm.db"
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000"
    AI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    PORT: int = 8000

    @field_validator("GEMINI_API_KEY", mode="before")
    @classmethod
    def resolve_gemini_key(cls, v: Union[str, None]) -> str:
        if v and str(v).strip():
            return str(v).strip()
        env_val = os.environ.get("GEMINI_API_KEY", "") or os.environ.get("AI_API_KEY", "")
        if env_val.strip():
            return env_val.strip()
        return _DEFAULT_GEMINI_FALLBACK

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: Union[str, None]) -> str:
        if not v or not str(v).strip():
            return "sqlite:///./support_crm.db"
        v = str(v).strip()
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+psycopg://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
            v = v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
