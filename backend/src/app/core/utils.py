"""Expense-specific utilities."""

# ISO 4217 major currencies – extend as needed
_SUPPORTED_CURRENCIES: set[str] = {
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
    "NGN",
    "MXN",
    "SGD",
    "HKD",
    "NOK",
    "KRW",
    "TRY",
    "RUB",
    "INR",
    "BRL",
    "ZAR",
}


def is_valid_currency(currency: str) -> bool:
    """
    Validate if a currency code is supported.

    Args:
        currency (str): 3-letter uppercase currency code (e.g., 'USD').

    Returns:
        bool: True if valid and supported.
    """
    return currency.upper() in _SUPPORTED_CURRENCIES
