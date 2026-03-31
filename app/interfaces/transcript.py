from typing import Protocol


class ITranscriptFetcher(Protocol):
    def __call__(self, url: str) -> str: ...
