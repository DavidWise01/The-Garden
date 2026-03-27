from sentence_transformers import SentenceTransformer
from .config import settings

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model


def embed_text(text: str) -> list:
    model = get_model()
    vec = model.encode([text])[0]
    return vec.tolist()
