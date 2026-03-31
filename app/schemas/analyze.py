from enum import Enum

from pydantic import BaseModel, Field


class AnalysisMode(str, Enum):
    summary = "summary"
    bullets = "bullets"
    risk_flags = "risk_flags"
    risk_score = "risk_score"


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1)
    mode: AnalysisMode


class AnalyzeResponse(BaseModel):
    mode: AnalysisMode
    result: str
    model: str
