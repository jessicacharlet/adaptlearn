import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
features = joblib.load(BASE_DIR / "feature_names.pkl")
print(features)
