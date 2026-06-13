from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "ml" / "learning_style_model.pkl"
DATASET_PATH = BASE_DIR.parent / "dataset" / "combined_final_dataset.csv"

model = joblib.load(MODEL_PATH)

FEATURES = [
    "hand_raise",
    "resource_visits",
    "announcement_views",
    "discussion_posts",
    "free_time",
    "study_time",
    "absences",
    "final_grade",
    "total_actions",
    "video_actions",
    "audio_actions",
    "text_actions",
    "platform_Unknown",
]


@app.route("/")
def home():
    return "Learning Style Prediction API Running"


@app.route("/student-login", methods=["POST"])
def student_login():
    try:
        data = request.get_json() or {}
        payload = {
            "student_name": data.get("student_name", "").strip(),
            "student_id": data.get("student_id", "").strip(),
        }

        if not payload["student_name"] or not payload["student_id"]:
            return jsonify({"error": "student_name and student_id are required"}), 400

        return jsonify({"message": "Student login received", "student": payload})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json() or {}
        input_data = [data.get(feature, 0) for feature in FEATURES]
        input_array = np.array(input_data).reshape(1, -1)
        prediction = model.predict(input_array)[0]

        return jsonify(
            {
                "prediction": str(prediction),
                "features_used": dict(zip(FEATURES, input_data)),
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/behavior-track", methods=["POST"])
def behavior_track():
    try:
        data = request.get_json() or {}
        if not data.get("student_id"):
            return jsonify({"error": "student_id is required"}), 400

        return jsonify({"message": "Behavior tracking received"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/save-report", methods=["POST"])
def save_report():
    try:
        data = request.get_json() or {}
        if not data.get("student_id"):
            return jsonify({"error": "student_id is required"}), 400

        return jsonify({"message": "Report received"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/dataset-summary", methods=["GET"])
def dataset_summary():
    try:
        df = pd.read_csv(DATASET_PATH)

        numeric_columns = [
            "hand_raise",
            "resource_visits",
            "announcement_views",
            "discussion_posts",
            "study_time",
            "absences",
            "final_grade",
        ]

        summary = {
            "total_students": int(len(df)),
            "learning_style_distribution": df["learning_style"].fillna("Unknown").value_counts().to_dict(),
            "average_metrics": {
                col: round(float(df[col].fillna(0).mean()), 2)
                for col in numeric_columns
                if col in df.columns
            },
            "performance_bands": {
                "high_grade": int((df["final_grade"].fillna(0) >= 70).sum()) if "final_grade" in df.columns else 0,
                "medium_grade": int(
                    ((df["final_grade"].fillna(0) >= 40) & (df["final_grade"].fillna(0) < 70)).sum()
                )
                if "final_grade" in df.columns
                else 0,
                "low_grade": int((df["final_grade"].fillna(0) < 40).sum()) if "final_grade" in df.columns else 0,
            },
        }

        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
