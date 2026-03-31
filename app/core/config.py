from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    anthropic_api_key: str
    api_key: str
    app_name: str = "beaurocracybgone"
    llm_model: str = "claude-sonnet-4-6"
    llm_max_tokens: int = 2048


settings = Settings()
