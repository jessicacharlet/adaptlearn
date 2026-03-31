import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

# Load dataset
df = pd.read_csv(DATASET_DIR / "combined_final_dataset.csv")

# Drop rows where target is NaN
df = df.dropna(subset=["learning_style"])

# Drop useless columns if present
df = df.drop(columns=["total_actions", "video_actions", "audio_actions", "text_actions"], errors="ignore")

# Split features and target
X = df.drop("learning_style", axis=1)
y = df["learning_style"]

# Encode categorical features
for col in X.columns:
    if X[col].dtype == "object":
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))

# Encode target
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Handle missing values
imputer = SimpleImputer(strategy="mean")
X = imputer.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Pick one test sample
sample = X_test[0].reshape(1, -1)

# Predict probabilities
probs = model.predict_proba(sample)[0]
classes = label_encoder.inverse_transform(np.arange(len(probs)))

print("Prediction Confidence:")
for cls, p in zip(classes, probs):
    print(f"{cls}: {p:.2f}")

# Plot
plt.figure(figsize=(6,4))
plt.bar(classes, probs)
plt.xlabel("Learning Style")
plt.ylabel("Probability")
plt.title("Prediction Confidence")
plt.show()
