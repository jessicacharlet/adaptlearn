import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

# -------------------------
# Load dataset
# -------------------------
df = pd.read_csv(DATASET_DIR / "combined_final_dataset.csv")
print("Original dataset shape:", df.shape)

# -------------------------
# Drop rows where target is missing
# -------------------------
df = df.dropna(subset=["learning_style"])

y = df["learning_style"]
X = df.drop("learning_style", axis=1)

# -------------------------
# Handle missing values
# -------------------------

# Numeric → mean
numeric_cols = X.select_dtypes(include=["number"]).columns
X[numeric_cols] = X[numeric_cols].fillna(X[numeric_cols].mean())

# Categorical → mode OR 'Unknown'
categorical_cols = X.select_dtypes(include=["object"]).columns
for col in categorical_cols:
    if X[col].mode().empty:
        X[col] = X[col].fillna("Unknown")
    else:
        X[col] = X[col].fillna(X[col].mode().iloc[0])

# -------------------------
# One-hot encoding
# -------------------------
X = pd.get_dummies(X)

print("Processed feature shape:", X.shape)

# -------------------------
# Train-test split
# -------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------
# Train model
# -------------------------
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# -------------------------
# Evaluate
# -------------------------
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print("Model Accuracy:", accuracy)

# -------------------------
# Save artifacts
# -------------------------
joblib.dump(model, BASE_DIR / "learning_style_model.pkl")
joblib.dump(list(X.columns), BASE_DIR / "feature_names.pkl")

print("Model and feature names saved successfully!")
