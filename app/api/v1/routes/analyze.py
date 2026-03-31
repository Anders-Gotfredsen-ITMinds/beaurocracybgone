import logging

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated

logger = logging.getLogger(__name__)

from app.core.security import verify_api_key
from app.dependencies import get_analysis_service
from app.interfaces.analysis import IAnalysisService
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse

router = APIRouter()


@router.post("/", response_model=AnalyzeResponse)
def analyze(
    request: AnalyzeRequest,
    service: Annotated[IAnalysisService, Depends(get_analysis_service)],
    _: None = Depends(verify_api_key),
) -> AnalyzeResponse:
    try:
        result, model = service.analyze(request.text, request.mode)
    except anthropic.APIError as e:
        logger.exception("Anthropic API error: %s", e)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Upstream LLM error") from e

    return AnalyzeResponse(mode=request.mode, result=result, model=model)
