import datetime
from pydantic import BaseModel, ConfigDict, Field


class NoteBase(BaseModel):
    note_text: str = Field(..., min_length=1, description="Text content of the note")


class NoteCreate(NoteBase):
    pass


class NoteResponse(BaseModel):
    id: int
    note_text: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
