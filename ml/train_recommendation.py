import pandas as pd
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
import os

# Set paths
DATA_PATH = r"c:\Users\saira\OneDrive\Documents\persoal-pro\ecom-platform\amazon.csv"
SAVE_DIR = r"c:\Users\saira\OneDrive\Documents\persoal-pro\ecom-platform\ml\recommendation_models"

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

print("Loading data...")
df = pd.read_csv(DATA_PATH)

print("Cleaning data...")
# Data cleaning (based on the notebook)
df['discounted_price'] = df['discounted_price'].str.replace("₹",'').str.replace(",",'').astype('float64')
df['actual_price'] = df['actual_price'].str.replace("₹",'').str.replace(",",'').astype('float64')
df['discount_percentage'] = df['discount_percentage'].str.replace('%','').astype('float64') / 100
df['rating'] = df['rating'].str.replace('|', '3.9').astype('float64')
df['rating_count'] = df['rating_count'].str.replace(',', '').astype('float64')

# Handle missing values
df['about_product'] = df['about_product'].fillna('')

print("Training TF-IDF...")
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['about_product'])

print("Saving models...")
joblib.dump(tfidf, os.path.join(SAVE_DIR, "tfidf_vectorizer.pkl"))
joblib.dump(tfidf_matrix, os.path.join(SAVE_DIR, "tfidf_matrix.pkl"))
joblib.dump(df, os.path.join(SAVE_DIR, "products_dataframe.pkl"))

print("Recommendation model assets saved successfully!")
