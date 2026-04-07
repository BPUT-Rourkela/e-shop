import os
import joblib
import pandas as pd
from sentence_transformers import SentenceTransformer

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REC_MODEL_DIR = os.path.join(BASE_DIR, "recommendation_models")

# Path to the dataset and the output file
PRODUCTS_FILE = os.path.join(REC_MODEL_DIR, "products_dataframe.pkl")
OUTPUT_FILE = os.path.join(REC_MODEL_DIR, "sentence_embeddings.pkl")

def main():
    print("Loading products dataframe...")
    if not os.path.exists(PRODUCTS_FILE):
        print(f"Error: Could not find {PRODUCTS_FILE}")
        return

    products_df = joblib.load(PRODUCTS_FILE)
    
    # We will encode the product names. We convert them to strings and fill missing values just in case
    product_names = products_df['product_name'].fillna("").astype(str).tolist()
    print(f"Loaded {len(product_names)} products.")

    print("Loading sentence-transformers model (all-MiniLM-L6-v2)...")
    # This might download the model if it's not present locally
    model = SentenceTransformer('all-MiniLM-L6-v2')

    print("Generating embeddings... This might take a minute.")
    # Show progress bar if possible (works in terminal)
    embeddings = model.encode(product_names, show_progress_bar=True)
    
    print(f"Generated embeddings shape: {embeddings.shape}")
    
    print("Saving embeddings to file...")
    joblib.dump(embeddings, OUTPUT_FILE)
    print("Done! 🎉")

if __name__ == "__main__":
    main()
