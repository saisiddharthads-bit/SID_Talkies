from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl

class SourceReference(BaseModel):
    title: str
    url: str
    snippet: str
    published_date: Optional[str] = None

class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    max_sources: int = Field(default=3, ge=1, le=10)

class ResearchReport(BaseModel):
    query: str
    summary: str
    key_findings: List[str]
    sources: List[SourceReference]
    conflicts_or_uncertainties: Optional[str] = None
