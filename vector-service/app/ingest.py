import json
import os
from pathlib import Path

import faiss
import numpy as np
import tiktoken
from openai import OpenAI
from pypdf import PdfReader


DOCS_DIR = Path(os.getenv("DOCS_DIR", "/docs"))
DATA_DIR = Path(os.getenv("VECTOR_DATA_DIR", "/data/faiss"))
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
CHUNK_TOKENS = int(os.getenv("CHUNK_TOKENS", "400"))


def pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def chunks(text: str) -> list[str]:
    encoding = tiktoken.get_encoding("cl100k_base")
    token_ids = encoding.encode(text)
    output = []
    for start in range(0, len(token_ids), CHUNK_TOKENS):
        piece = token_ids[start : start + CHUNK_TOKENS]
        if piece:
            output.append(encoding.decode(piece))
    return output


def embed_batch(texts: list[str]) -> np.ndarray:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "missing-key"), timeout=60)
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return np.array([item.embedding for item in response.data], dtype="float32")


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    metadata = []
    all_texts = []
    for path in DOCS_DIR.glob("*.pdf"):
        for chunk in chunks(pdf_text(path)):
            metadata.append({"source": path.name, "text": chunk})
            all_texts.append(chunk)

    if not all_texts:
        raise SystemExit(f"No PDFs found in {DOCS_DIR}. Add WHO, CDC, first-aid, and emergency references.")

    vectors = embed_batch(all_texts)
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    faiss.write_index(index, str(DATA_DIR / "medical.index"))
    (DATA_DIR / "chunks.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Wrote {len(metadata)} chunks to {DATA_DIR}")


if __name__ == "__main__":
    main()

