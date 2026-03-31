import anthropic
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import verify_api_key
from app.dependencies import get_factcheck_service, get_transcript_fetcher
from app.interfaces.factcheck import IFactCheckService
from app.interfaces.transcript import ITranscriptFetcher
from app.schemas.factcheck import FactCheckRequest, FactCheckResponse
from app.services.transcript import TranscriptError

router = APIRouter()


@router.post("/", response_model=FactCheckResponse)
def factcheck(
    request: FactCheckRequest,
    factcheck_service: Annotated[IFactCheckService, Depends(get_factcheck_service)],
    transcript_fetcher: Annotated[ITranscriptFetcher, Depends(get_transcript_fetcher)],
    _: None = Depends(verify_api_key),
) -> FactCheckResponse:
    try:
        transcript = transcript_fetcher(request.url)
    except TranscriptError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    try:
        claims, model = factcheck_service.fact_check(transcript)
    except anthropic.APIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Upstream LLM error") from e

    return FactCheckResponse(
        url=request.url,
        transcript_excerpt=transcript[:500],
        claims=claims,
        model=model,
    )
