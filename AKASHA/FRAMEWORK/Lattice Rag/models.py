from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import declarative_base
from pgvector.sqlalchemy import Vector
from .config import settings

Base = declarative_base()


class Axiom(Base):
    __tablename__ = "axioms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node = Column(String(8), unique=True, index=True)
    hemisphere = Column(String(16))
    domain = Column(String(32))
    name = Column(String(128))
    chosen_name = Column(String(128))
    function = Column(Text)
    inverse_node = Column(String(8), index=True)
    raw_text = Column(Text)


class DocChunk(Base):
    __tablename__ = "doc_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_file = Column(String(256))
    path = Column(String(256), index=True, nullable=True)
    kind = Column(String(32))
    key = Column(String(64), index=True, nullable=True)
    text = Column(Text)
    hemisphere = Column(String(16), nullable=True)
    domain = Column(String(32), nullable=True)
    node = Column(String(8), nullable=True)
    inverse_node = Column(String(8), nullable=True)
    embedding = Column(Vector(settings.EMBEDDING_DIM))


class PeerContext(Base):
    __tablename__ = "peer_context"

    id = Column(Integer, primary_key=True, autoincrement=True)
    peer_id = Column(String(64), index=True)
    context_type = Column(String(32))  # episodic, semantic, procedural, identity
    source_file = Column(String(256))
    text = Column(Text)
    embedding = Column(Vector(settings.EMBEDDING_DIM))
