class Spark:
    """Universal primitive for data currency mirroring."""
    @staticmethod
    def mirror_query(intent: str) -> dict:
        """
        Returns a declaration of what will be searched, timeframe, context.
        This must be shown to the user before any answer is generated.
        """
        # In a real system, this would parse the intent and produce a deterministic plan.
        # For demonstration, we return a structured mirror.
        declaration = {
            "what": ["reliable news sources", "official election results", "verified fact databases"],
            "timeframe": "2024-2026 (including post-election certification and inauguration)",
            "context": "factual, non‑speculative, with citations where available"
        }
        return declaration

    @staticmethod
    def require_currency_check(user_confirmation: str) -> bool:
        """User must confirm the mirror before the engine proceeds."""
        return user_confirmation.strip().upper() == "Y"
