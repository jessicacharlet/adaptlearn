import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

# Load dataset
file_path = DATASET_DIR / "combined_final_dataset.csv"

df = pd.read_csv(file_path)

print("Dataset loaded successfully!")
print("Total Rows:", df.shape[0])
print("Total Columns:", df.shape[1])

# ================================
# 1. Learning Style Distribution
# ================================
style_counts = df['learning_style'].value_counts()
print("\nLearning Style Distribution:\n", style_counts)

plt.figure()
style_counts.plot(kind='bar')
plt.title("Log Analysis: Learning Style Distribution")
plt.xlabel("Learning Style")
plt.ylabel("Count")
plt.show()

# ================================
# 2. Action Type Analysis
# ================================
action_cols = ['video_actions', 'text_actions', 'audio_actions']

action_means = df[action_cols].mean()
print("\nAverage Actions:\n", action_means)

plt.figure()
action_means.plot(kind='bar')
plt.title("Average Action Types")
plt.xlabel("Action Type")
plt.ylabel("Average Count")
plt.show()

# ================================
# 3. Total Actions Distribution
# ================================
plt.figure()
df['total_actions'].hist(bins=20)
plt.title("Total Actions Distribution")
plt.xlabel("Total Actions")
plt.ylabel("Frequency")
plt.show()

# ================================
# 4. Correlation Analysis
# ================================
corr = df[action_cols + ['total_actions']].corr()
print("\nCorrelation Matrix:\n", corr)

plt.figure()
plt.imshow(corr, cmap='coolwarm')
plt.colorbar()
plt.xticks(range(len(corr.columns)), corr.columns, rotation=45)
plt.yticks(range(len(corr.columns)), corr.columns)
plt.title("Correlation Heatmap")
plt.show()

print("\nLog Analysis Completed Successfully!")
