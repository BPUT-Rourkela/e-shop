from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
import re
import string
from typing import List, Optional

from contextlib import asynccontextmanager

# Paths to models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REC_MODEL_DIR = os.path.join(BASE_DIR, "recommendation_models")
SENT_MODEL_DIR = os.path.join(BASE_DIR, "sentiment_models")

# Global variables for models
rec_tfidf = None
rec_matrix = None
products_df = None
sent_tfidf = None
sent_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global rec_tfidf, rec_matrix, products_df, sent_tfidf, sent_model
    try:
        rec_tfidf = joblib.load(os.path.join(REC_MODEL_DIR, "tfidf_vectorizer.pkl"))
        rec_matrix = joblib.load(os.path.join(REC_MODEL_DIR, "tfidf_matrix.pkl"))
        products_df = joblib.load(os.path.join(REC_MODEL_DIR, "products_dataframe.pkl"))
        sent_tfidf = joblib.load(os.path.join(SENT_MODEL_DIR, "sentiment_vectorizer.pkl"))
        sent_model = joblib.load(os.path.join(SENT_MODEL_DIR, "sentiment_model.pkl"))
        print("Models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")
    yield

app = FastAPI(title="E-commerce ML API", lifespan=lifespan)


def clean_amazon_image_url(url: str) -> str:
    """
    Strip the /W/WEBP_XXXXXX-XX/ CDN transform segment from Amazon image URLs.

    Bad:  https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/412fxJY-gxL._SX300_SY300_QL70_FMwebp_.jpg
    Good: https://m.media-amazon.com/images/I/412fxJY-gxL._SX300_SY300_QL70_FMwebp_.jpg
    """
    if not url or str(url).strip().lower() in ('nan', 'none', ''):
        return ''
    # Remove the /W/<CDN_DIRECTIVE>/ path segment that causes 400 errors
    cleaned = re.sub(r'/W/[^/]+/', '/', str(url).strip())
    return cleaned


class RecommendRequest(BaseModel):
    # PRIMARY: Send product name/description text — works with any DB
    product_texts: Optional[List[str]] = None
    # LEGACY: Amazon product_id based (only works if ID exists in amazon.csv)
    viewed_product_ids: Optional[List[str]] = None


class SentimentRequest(BaseModel):
    text: str


@app.get("/")
def read_root():
    return {"status": "ok", "message": "ML API is running"}


@app.post("/recommend")
def recommend(request: RecommendRequest):
    if products_df is None or rec_matrix is None:
        raise HTTPException(status_code=500, detail="Models not loaded")

    recommendations = []

    # ---- MODE 1: Text-based (Primary — works with MongoDB products) ----
    if request.product_texts and len(request.product_texts) > 0:
        # Combine all texts into one query
        combined_text = " ".join(request.product_texts)

        # Transform query text using the trained TF-IDF
        query_vector = rec_tfidf.transform([combined_text])

        # Cosine similarity against all Amazon products
        similarity_scores = cosine_similarity(query_vector, rec_matrix).flatten()

        # Get top indices sorted by score
        top_indices = similarity_scores.argsort()[::-1][:50]

        seen_ids = set()
        for idx in top_indices:
            product_id = str(products_df.iloc[idx]['product_id'])
            if product_id in seen_ids:
                continue
            seen_ids.add(product_id)

            row = products_df.iloc[idx]
            recommendations.append({
                "product_id": product_id,
                "name": str(row['product_name']),
                "category": str(row['category']),
                "image": clean_amazon_image_url(row['img_link']),
                "product_link": str(row['product_link']),
                "rating": float(row['rating']) if not pd.isna(row['rating']) else 0.0,
                "price": float(row['discounted_price']) if not pd.isna(row['discounted_price']) else 0.0,
                "actual_price": float(row['actual_price']) if not pd.isna(row['actual_price']) else 0.0,
                "description": str(row.get('about_product', ''))[:200],
                "score": float(similarity_scores[idx])
            })
            if len(recommendations) >= 8:
                break

    # ---- MODE 2: Amazon product ID based (legacy fallback) ----
    elif request.viewed_product_ids and len(request.viewed_product_ids) > 0:
        viewed_indices = products_df[
            products_df['product_id'].isin(request.viewed_product_ids)
        ].index.tolist()

        if viewed_indices:
            viewed_tfidf = rec_matrix[viewed_indices]
            similarity_scores = cosine_similarity(viewed_tfidf, rec_matrix).mean(axis=0)
            similar_indices = similarity_scores.argsort()[::-1]

            for idx in similar_indices:
                product_id = str(products_df.iloc[idx]['product_id'])
                if product_id not in request.viewed_product_ids:
                    row = products_df.iloc[idx]
                    recommendations.append({
                        "product_id": product_id,
                        "name": str(row['product_name']),
                        "category": str(row['category']),
                        "image": clean_amazon_image_url(row['img_link']),
                        "product_link": str(row['product_link']),
                        "rating": float(row['rating']) if not pd.isna(row['rating']) else 0.0,
                        "price": float(row['discounted_price']) if not pd.isna(row['discounted_price']) else 0.0,
                        "actual_price": float(row['actual_price']) if not pd.isna(row['actual_price']) else 0.0,
                        "description": str(row.get('about_product', ''))[:200],
                        "score": float(similarity_scores[idx])
                    })
                if len(recommendations) >= 8:
                    break

    return {"recommendations": recommendations}


@app.post("/analyze_sentiment")
def analyze_sentiment(request: SentimentRequest):
    if sent_model is None or sent_tfidf is None:
        raise HTTPException(status_code=500, detail="Sentiment models not loaded")

    text = request.text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = text.translate(str.maketrans('', '', string.punctuation))

    X = sent_tfidf.transform([text])
    prediction = sent_model.predict(X)[0]

    return {"sentiment": prediction}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
