import json

import anthropic

from app.schemas.factcheck import Claim


class FactCheckService:
    def __init__(self, api_key: str, model: str, max_tokens: int, system_prompt: str) -> None:
        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model
        self._max_tokens = max_tokens
        self._system_prompt = system_prompt

    def fact_check(self, transcript: str) -> tuple[list[Claim], str]:
        response = self._client.messages.create(
            model=self._model,
            max_tokens=self._max_tokens,
            system=self._system_prompt,
            messages=[{"role": "user", "content": transcript}],
        )
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = "\n".join(raw.split("\n")[1:])
            raw = raw.rsplit("```", 1)[0].strip()
        claims = [Claim(**item) for item in json.loads(raw)]
        return claims, response.model
