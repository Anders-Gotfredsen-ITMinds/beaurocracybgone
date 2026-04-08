from app.core.config import settings
from app.interfaces.analysis import IAnalysisService
from app.interfaces.factcheck import IFactCheckService
from app.interfaces.transcript import ITranscriptFetcher
from app.services.analysis import AnalysisService
from app.services.factcheck import FactCheckService
from app.services.prompts import ANALYSIS_PROMPTS, FACT_CHECK_PROMPT
from app.services.transcript import fetch_transcript


def get_analysis_service() -> IAnalysisService:
    return AnalysisService(
        api_key=settings.anthropic_api_key,
        model=settings.llm_model,
        max_tokens=settings.llm_max_tokens,
        prompts=ANALYSIS_PROMPTS,
    )


def get_factcheck_service() -> IFactCheckService:
    return FactCheckService(
        api_key=settings.anthropic_api_key,
        model=settings.llm_model,
        max_tokens=settings.llm_fact_check_max_tokens,
        system_prompt=FACT_CHECK_PROMPT,
    )


def get_transcript_fetcher() -> ITranscriptFetcher:
    return fetch_transcript
