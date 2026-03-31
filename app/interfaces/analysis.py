from typing import Protocol

from app.schemas.analyze import AnalysisMode


class IAnalysisService(Protocol):
    def analyze(self, text: str, mode: AnalysisMode) -> tuple[str, str]: ...
