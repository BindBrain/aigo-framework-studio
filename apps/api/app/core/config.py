from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://aigo:aigo_dev_password@127.0.0.1:5433/aigo"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"


settings = Settings()