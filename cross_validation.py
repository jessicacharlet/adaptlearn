import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# -------------------------
# Load dataset
# -------------------------
df = pd.read_csv("combined_final_dataset.csv")

# -------------------------
# Target column
# -------------------------
y = df["learning_style"]

# Drop target from features
X = df.drop("learning_style", axis=1)

# -------------------------
# Encode categorical features
# -------------------------
for col in X.columns:
    if X[col].dtype == "object":
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))

# -------------------------
# Encode target labels
# -------------------------
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# -------------------------
# Model
# -------------------------
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

# -------------------------
# 5-Fold Cross Validation
# -------------------------
scores = cross_val_score(model, X, y, cv=5)

print("Cross-validation scores:", scores)
print("Average accuracy (Random Forest):", scores.mean())
