import json
import os
import time
from pathlib import Path

import faiss
import numpy as np
from fastapi import FastAPI
from fastapi.responses import Response
from openai import OpenAI
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from pydantic import BaseModel


DATA_DIR = Path(os.getenv("VECTOR_DATA_DIR", "/data/faiss"))
INDEX_PATH = DATA_DIR / "medical.index"
META_PATH = DATA_DIR / "chunks.json"
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

app = FastAPI(title="Healthcare AI Vector Service", version="0.1.0")
SEARCH_COUNT = Counter("vector_search_requests_total", "Vector search request count")
SEARCH_LATENCY = Histogram("vector_search_latency_seconds", "Vector search latency")


class SearchRequest(BaseModel):
    query: str
    top_k: int = 3


def client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY", "missing-key"), timeout=20)


def embed(text: str) -> np.ndarray:
    response = client().embeddings.create(model=EMBEDDING_MODEL, input=text)
    vector = np.array(response.data[0].embedding, dtype="float32")
    return vector.reshape(1, -1)


def load_store() -> tuple[faiss.Index | None, list[dict]]:
    if not INDEX_PATH.exists() or not META_PATH.exists():
        return None, []
    return faiss.read_index(str(INDEX_PATH)), json.loads(META_PATH.read_text(encoding="utf-8"))


@app.get("/health")
def health() -> dict:
    index, chunks = load_store()
    return {"status": "healthy", "index_loaded": index is not None, "chunks": len(chunks)}


@app.get("/metrics")
def metrics() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/search")
def search(payload: SearchRequest) -> dict:
    SEARCH_COUNT.inc()
    start = time.perf_counter()
    try:
        index, chunks = load_store()
        if index is None:
            return {"matches": []}
        query_vector = embed(payload.query)
        distances, indexes = index.search(query_vector, payload.top_k)
        matches = []
        for distance, idx in zip(distances[0], indexes[0]):
            if idx >= 0 and idx < len(chunks):
                matches.append({"score": float(distance), "text": chunks[idx]["text"], "source": chunks[idx]["source"]})
        return {"matches": matches}
    finally:
        SEARCH_LATENCY.observe(time.perf_counter() - start)

