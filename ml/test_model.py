import pandas as pd
import joblib
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

# -------------------------
# Load test data
# -------------------------
test_df = pd.read_csv(DATASET_DIR / "test_data.csv")

X_test = test_df.drop("learning_style", axis=1)
y_test = test_df["learning_style"]

# -------------------------
# Load trained model
# -------------------------
model = joblib.load(BASE_DIR / "learning_style_model.pkl")

# -------------------------
# Predict
# -------------------------
y_pred = model.predict(X_test)

# -------------------------
# Evaluation
# -------------------------
print("Model Testing Results\n")

accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))
