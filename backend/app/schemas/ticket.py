import datetime
import re
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.note import NoteResponse

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
StatusType = Literal["Open", "In Progress", "Closed"]


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_email: str = Field(..., max_length=255)
    subject: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)

    @field_validator("customer_name", "subject", "description", mode="before")
    @classmethod
    def strip_and_validate_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be empty or just whitespace")
        return v

    @field_validator("customer_email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip()
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email address format")
        return v


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class TicketListResponse(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: StatusType
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class TicketDetailResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: StatusType
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    notes: List[NoteResponse] = Field([], description="Chronological conversation messages between customer and agent")

    model_config = ConfigDict(from_attributes=True)


class TicketUpdateRequest(BaseModel):
    status: StatusType
    notes: Optional[str] = Field(None, description="New reply message to append to the customer-agent conversation")

    @field_validator("notes", mode="before")
    @classmethod
    def clean_optional_notes(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
        return v


class TicketUpdateResponse(BaseModel):
    success: bool = True
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
