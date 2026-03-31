from pydantic import BaseModel, Field


class Claim(BaseModel):
    claim: str
    verdict: str  # "True", "False", "Uncertain", "Opinion"
    explanation: str


class FactCheckRequest(BaseModel):
    url: str = Field(..., description="URL of the video to fact-check")


class FactCheckResponse(BaseModel):
    url: str
    transcript_excerpt: str = Field(..., description="First 500 chars of transcript for reference")
    claims: list[Claim]
    model: str
