import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# Load dataset
df = pd.read_csv("dataset_with_synthetic_features.csv")

print("Dataset shape:", df.shape)

# Target
y = df["learning_style"]

# Drop target column
X = df.drop(columns=["learning_style"])

# Encode categorical columns
cat_cols = X.select_dtypes(include=["object"]).columns
for col in cat_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])

# Fill missing values
X = X.fillna(X.mean(numeric_only=True))

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model
model = RandomForestClassifier(n_estimators=150, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print("Model Accuracy:", acc)

# Save model and feature list
joblib.dump(model, "learning_model.pkl")
joblib.dump(list(X.columns), "feature_names.pkl")

print("Model and features saved successfully!")
