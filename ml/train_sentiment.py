import pandas as pd
import numpy as np
import joblib
import re
import string
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import os

# Download NLTK data
nltk.download('punkt')
nltk.download('stopwords')

# Set paths
DATA_PATH = r"c:\Users\saira\OneDrive\Documents\persoal-pro\ecom-platform\amazon.csv"
SAVE_DIR = r"c:\Users\saira\OneDrive\Documents\persoal-pro\ecom-platform\ml\sentiment_models"

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

# Initialize tools
stemmer = PorterStemmer()
stop_words = set(stopwords.words('english'))
analyzer = SentimentIntensityAnalyzer()

def clean_text(text):
    if isinstance(text, str):
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\[.*?\]\(.*?\)', '', text)
        text = re.sub(r'@\w+', '', text)
        text = text.translate(str.maketrans('', '', string.punctuation))
        return text
    return ""

def classify_sentiment(compound_score):
    if compound_score >= 0.05:
        return 'Positive'
    elif compound_score <= -0.05:
        return 'Negative'
    else:
        return 'Neutral'

print("Loading and preprocessing data...")
df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=['review_content'])

print("Cleaning text...")
df['Cleaned_Review'] = df['review_content'].apply(clean_text)

print("Labeling with VADER...")
df['vader_scores'] = df['Cleaned_Review'].apply(lambda x: analyzer.polarity_scores(x))
df['compound'] = df['vader_scores'].apply(lambda score_dict: score_dict['compound'])
df['sentiment'] = df['compound'].apply(classify_sentiment)

print("Training TF-IDF...")
tfidf = TfidfVectorizer(max_features=5000)
X = tfidf.fit_transform(df['Cleaned_Review'])
y = df['sentiment']

print("Training Sentiment Classifier (Logistic Regression)...")
# Using LogisticRegression for better compatibility and speed in this setup
model = LogisticRegression(max_iter=1000)
model.fit(X, y)

print("Saving sentiment models...")
joblib.dump(tfidf, os.path.join(SAVE_DIR, "sentiment_vectorizer.pkl"))
joblib.dump(model, os.path.join(SAVE_DIR, "sentiment_model.pkl"))

print("Sentiment model assets saved!")
