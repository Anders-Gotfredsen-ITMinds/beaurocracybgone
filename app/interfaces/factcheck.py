from typing import Protocol

from app.schemas.factcheck import Claim


class IFactCheckService(Protocol):
    def fact_check(self, transcript: str) -> tuple[list[Claim], str]: ...
