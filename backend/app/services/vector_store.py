import os
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from app.core.config import settings

class VectorStore:
    def __init__(self):
        self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.vector_store_path = Path(settings.VECTOR_STORE_PATH)
        self.vector_store_path.mkdir(parents=True, exist_ok=True)
        self.index_path = self.vector_store_path / "faiss.index"
        self.texts_path = self.vector_store_path / "texts.npy"
        self.dimension = 384  # dimension for all-MiniLM-L6-v2
        
        if self.index_path.exists() and self.texts_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            self.texts = np.load(str(self.texts_path), allow_pickle=True)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.texts = np.array([], dtype=object)

    def add_texts(self, texts: List[str]) -> None:
        """Add texts to the vector store."""
        if not texts:
            return

        embeddings = self.embedding_model.encode(texts)
        self.index.add(embeddings)
        
        # Update texts array
        self.texts = np.append(self.texts, texts)
        
        # Save to disk
        self._save_index()

    def search(self, query: str, k: int = 5) -> List[str]:
        """Search for similar texts in the vector store."""
        if self.index.ntotal == 0:
            return []

        query_embedding = self.embedding_model.encode([query])
        distances, indices = self.index.search(query_embedding, k)
        
        return [self.texts[i] for i in indices[0]]

    def _save_index(self) -> None:
        """Save the index and texts to disk."""
        faiss.write_index(self.index, str(self.index_path))
        np.save(str(self.texts_path), self.texts)

vector_store = VectorStore() 