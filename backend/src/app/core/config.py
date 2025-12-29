"""
Pydantic-based configuragion management for the application.
"""

from typing import Any, Optional
from pydantic import field_validator, model_validator, AnyUrl, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    """
    Application configuration settings.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Application
    APP_NAME: str = "SpendHelm"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_V1_STR: str = "/api/v1"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "The ultimate spending tracker application."
    ENVIRONMENT: str = "development"

    # JWT Settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Settings
    DB_HOST: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASS: Optional[SecretStr] = None
    DB_NAME: Optional[str] = None
    DB_PORT: int = 5432
    MAX_CONNECTIONS: int = 10
    TIMEOUT_SECONDS: float = 5.0
    RUN_MIGRATIONS: bool = True

    # CORS Settings
    CORS_ALLOWED_ORIGINS: Optional[str] = None  # Comma-separated list

    # SECURITY
    MIN_PASSWORD_LENGTH: int = 8
    REQUIRE_SPECIAL_CHAR: bool = True
    REQUIRE_NUMBER: bool = True
    REQUIRE_UPPERCASE: bool = True
    REQUIRE_LOWERCASE: bool = True
    MAX_LOGIN_ATTEMPTS: int = 5
    AUTH_RATE_LIMIT: str = "5/minute"

    # Miscellaneous
    DEBUG_MODE: bool = False
    LOG_LEVEL: str = "DEBUG"
    TIMEZONE: str = "UTC"
    LOCALE: str = "en_US.UTF-8"

    @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
    @classmethod
    def validate_cors_allowed_origins(cls, v):
        """Validate and parse CORS_ALLOWED_ORIGINS from a comma-separated string to a list."""
        if v is None:
            return None
        if isinstance(v, str):
            origins = [o.strip() for o in v.split(",") if o.strip()]
        else:
            origins = v or []

        validated = []
        for origin in origins:
            if origin == "*":
                validated.append(origin)
            else:
                try:
                    AnyUrl(origin)  # Validates scheme, host, etc.
                    validated.append(origin)
                except Exception as e:
                    raise ValueError(f"Invalid CORS origin: {origin} ({e})") from e
        return validated

    @model_validator(mode="after")
    def validate_required_fields(self) -> "Config":
        """Ensure that required fields are set."""

        required = {
            "JWT_SECRET_KEY": self.JWT_SECRET_KEY,
            "DB_HOST": self.DB_HOST,
            "DB_USER": self.DB_USER,
            "DB_PASS": self.DB_PASS,
            "DB_DB": self.DB_NAME,
        }

        def is_missing(value: Any) -> bool:
            if value is None:
                return True
            if isinstance(value, SecretStr):
                return not value.get_secret_value()
            return not value

        missing = [key for key, val in required.items() if is_missing(val)]
        if missing:
            raise ValueError(f"Missing required config: {', '.join(missing)}")
        return self

    @property
    def DATABASE_URL(self) -> str:
        """Construct the database URL if not provided."""

        pw = self.DB_PASS.get_secret_value() if self.DB_PASS else ""
        return f"postgresql+asyncpg://{self.DB_USER}:{pw}@{self.DB_HOST}:{
            self.DB_PORT
        }/{self.DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        frozen=True,
    )


config = Config()
