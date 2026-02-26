import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# -------------------------
# Load training data
# -------------------------
train_df = pd.read_csv("train_data.csv")
test_df = pd.read_csv("test_data.csv")

# -------------------------
# Split features and target
# -------------------------
X_train = train_df.drop("learning_style", axis=1)
y_train = train_df["learning_style"]

X_test = test_df.drop("learning_style", axis=1)
y_test = test_df["learning_style"]

# -------------------------
# Train model
# -------------------------
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print("Model training completed!")

# -------------------------
# Test model
# -------------------------
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print("\nModel Accuracy:", accuracy)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# -------------------------
# Save trained model
# -------------------------
joblib.dump(model, "learning_style_model.pkl")
print("\nModel saved as learning_style_model.pkl")
