import anthropic

from app.schemas.analyze import AnalysisMode


class AnalysisService:
    def __init__(self, api_key: str, model: str, max_tokens: int, prompts: dict[AnalysisMode, str]) -> None:
        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model
        self._max_tokens = max_tokens
        self._prompts = prompts

    def analyze(self, text: str, mode: AnalysisMode) -> tuple[str, str]:
        response = self._client.messages.create(
            model=self._model,
            max_tokens=self._max_tokens,
            system=self._prompts[mode],
            messages=[{"role": "user", "content": text}],
        )
        return response.content[0].text, response.model
