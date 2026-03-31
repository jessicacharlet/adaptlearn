from pathlib import Path

import pandas as pd

from db import get_collection


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR.parent / "dataset" / "combined_final_dataset.csv"
COLLECTION_NAME = "combined_final_dataset"


def main():
    df = pd.read_csv(DATASET_PATH)
    df = df.where(pd.notnull(df), None)

    records = df.to_dict(orient="records")
    collection = get_collection(COLLECTION_NAME)
    collection.delete_many({})

    if records:
        collection.insert_many(records)

    print(f"Imported {len(records)} records into MongoDB collection '{COLLECTION_NAME}'.")


if __name__ == "__main__":
    main()
