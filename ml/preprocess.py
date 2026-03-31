import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

# -----------------------------
# Step 1: Load dataset
# -----------------------------
df = pd.read_csv(DATASET_DIR / "combined_final_dataset.csv")

print("Dataset loaded successfully!")
print(df.head())

# -----------------------------
# Step 2: Check missing values
# -----------------------------
print("\nMissing values before handling:\n", df.isnull().sum())

# Separate numeric and categorical columns
numeric_cols = df.select_dtypes(include=['int64','float64']).columns
categorical_cols = df.select_dtypes(include=['object']).columns

# Fill missing numeric values with mean
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

# Fill missing categorical values with mode
for col in categorical_cols:
    df[col] = df[col].fillna(df[col].mode()[0])

print("\nMissing values after handling:\n", df.isnull().sum())

# -----------------------------
# Step 3: Encode categorical columns
# -----------------------------
encoder = LabelEncoder()

for col in categorical_cols:
    df[col] = encoder.fit_transform(df[col])

print("\nCategorical columns encoded successfully!")

# -----------------------------
# Step 4: Separate features and target
# -----------------------------
X = df.drop("learning_style", axis=1)
y = df["learning_style"]

# -----------------------------
# Step 5: Feature Scaling
# -----------------------------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# -----------------------------
# Step 6: Train-Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.3, random_state=42
)

# -----------------------------
# Step 7: Save preprocessed data
# -----------------------------
train_df = pd.DataFrame(X_train)
train_df["learning_style"] = y_train.values

test_df = pd.DataFrame(X_test)
test_df["learning_style"] = y_test.values

train_df.to_csv(DATASET_DIR / "train_data.csv", index=False)
test_df.to_csv(DATASET_DIR / "test_data.csv", index=False)

print("\nPreprocessing completed successfully!")
print("train_data.csv and test_data.csv files created.")
