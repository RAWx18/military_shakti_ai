from typing import List, Dict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

class ContextUtils:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()

    def extract_keywords(self, text: str, top_k: int = 5) -> List[str]:
        """Extract key terms from text using TF-IDF"""
        tfidf_matrix = self.vectorizer.fit_transform([text])
        feature_names = self.vectorizer.get_feature_names_out()
        
        importance = np.squeeze(tfidf_matrix.toarray())
        top_indices = importance.argsort()[-top_k:][::-1]
        
        return [feature_names[i] for i in top_indices]

    def summarize_context(self, chat_history: List[Dict]) -> str:
        """Generate a concise summary of chat history"""
        # Implement chat summarization logic
        pass