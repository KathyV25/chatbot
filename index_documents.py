import os
import pickle
import numpy as np
import faiss
from openai import OpenAI

DOCS_DIR = "docs"
INDEX_FILE = "legal_index.faiss"
DOCS_FILE = "legal_docs.pkl"

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise SystemExit("Set the OPENAI_API_KEY environment variable")

client = OpenAI(api_key=openai_api_key)


def embed_text(text: str) -> np.ndarray:
    resp = client.embeddings.create(model="text-embedding-ada-002", input=text)
    return np.array(resp.data[0].embedding, dtype="float32")


def load_documents():
    docs = []
    for fname in os.listdir(DOCS_DIR):
        path = os.path.join(DOCS_DIR, fname)
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as f:
                docs.append({"path": path, "text": f.read()})
    return docs


def main():
    documents = load_documents()
    if not documents:
        raise SystemExit(f"No documents found in {DOCS_DIR}")

    embeddings = [embed_text(doc["text"]) for doc in documents]
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.stack(embeddings))

    faiss.write_index(index, INDEX_FILE)
    with open(DOCS_FILE, "wb") as f:
        pickle.dump(documents, f)
    print(f"Wrote index to {INDEX_FILE} with {len(documents)} documents")


if __name__ == "__main__":
    main()
